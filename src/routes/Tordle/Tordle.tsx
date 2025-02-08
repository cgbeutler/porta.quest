import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import React, {FunctionComponent, useEffect, useMemo, useRef, useState} from "react";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import CopyIcon from '@mui/icons-material/ContentCopy';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import {clamp} from "../../lib/helpers/MathHelpers";
import {loadPuzzleData, savePuzzleData} from "../../lib/PuzzleData";
import {getProp} from "../../lib/helpers/ObjectHelpers";
import {copyToClipboard} from "../../lib/helpers/ClipboardHelpers";
import {alpha, cipher, decipher} from "../../lib/helpers/CipherHelpers";
import {keyboardUpper} from "../../lib/helpers/AlphabetHelpers";
import {daysSince} from "../../lib/helpers/DateHelpers";
import {getDictionaries, getDictionary} from "../../lib/Dictionaries";
import {getLine, getLineWrap} from "../../lib/helpers/StringHelpers";
import {psudorand} from "../../lib/helpers/RandomHelpers";

const day = daysSince(2024, 9, 10)

const Yordle: FunctionComponent = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const gameRef = useRef<HTMLElement>()

  const [loading, setLoading] = useState(true)
  const [dictionary, setDictionary] = useState<string|undefined>()
  const [puzzle, setPuzzle] = useState<string|undefined>()
  const [puzzleNumber, setPuzzleNumber] = useState<number|undefined>()
  const [maxFails, setMaxFails] = useState<number|undefined>()
  const [guesses, setGuesses] = useState<string[]>([])
  const [alsoShareLink, setAlsoShareLink] = useState(false)

  useEffect(() => {
    setLoading(true)
    // See if we have a specific puzzle
    let guesses = Number.parseInt(searchParams.get("g") ?? "6")??6
    let cipheredPuzzle = searchParams.get("a")
    if (cipheredPuzzle) {
      // Load puzzle from query string
      let dictFile = ""
      if (cipheredPuzzle.length >= 3 && cipheredPuzzle.length < 13 ) dictFile = `dictionary${cipheredPuzzle.length}.txt`
      else if (cipheredPuzzle.length >= 13) dictFile = "dictionary13plus.txt"
      const clearPuzzle = decipher(cipheredPuzzle)
      if (dictFile) getDictionary(dictFile).then(d => {
        setDictionary(d)
        setPuzzle(clearPuzzle)
        setPuzzleNumber(-1)
        setMaxFails(guesses)
        setLoading(false)
      }).catch(() => {
        setDictionary(undefined)
        setPuzzle(undefined)
        setPuzzleNumber(undefined)
        setMaxFails(undefined)
        setLoading(false)
      })
      return
    }
    // Load the day-number's puzzle
    let puzzleNumberRaw = searchParams.get("n")
    let puzzleNumber = puzzleNumberRaw ? Number.parseInt(puzzleNumberRaw) : NaN;
    // If no number, use today's puzzle
    if (!Number.isInteger(puzzleNumber)) puzzleNumber = day
    getDictionaries([`common_words5.txt`, `dictionary5.txt`]).then(d => {
      const commonWords = d[`common_words5.txt`]
      const puzzle = getLineWrap(commonWords, psudorand(puzzleNumber))
      const yesterday = getLineWrap(commonWords, psudorand(puzzleNumber-1))
      setDictionary(d[`dictionary5.txt`])
      setPuzzle(puzzle)
      setPuzzleNumber(puzzleNumber)
      setMaxFails(guesses)
      setLoading(false)
      setGuesses([yesterday])
    }).catch(() => {
      setDictionary(undefined)
      setPuzzle(undefined)
      setPuzzleNumber(undefined)
      setMaxFails(undefined)
      setLoading(false)
    })
  }, [searchParams])

  let state: ""|"success"|"fail" = useMemo(() => {
    if (loading || !puzzle || !maxFails) return ""
    if (guesses.some(c => c === puzzle)) return "success"
    if (guesses.length >= maxFails) return "fail"
    return ""
  }, [loading, guesses, puzzle, maxFails])
  let rowResults = useMemo(() => {
    if (loading || !puzzle || !maxFails) return []
    const results: string[] = []
    for (const guess in guesses) {
      let result: string = "" 
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i]
        if (puzzle[i] === letter) result += "🟩"
        if (puzzle.includes(letter)) result += "🟨"
        else result += "⬛"
      }
      results.push(result)
    }
    return results
  }, [loading, guesses, puzzle, maxFails])
  let resultString = useMemo(() => {
    if (loading || !puzzle || !maxFails || state === "") return ""
    let result = `Yordle #${puzzleNumber} ${rowResults.length}/${maxFails}\n${rowResults.join("\n")}`
    if (state === "fail") result += "💀"
    if (alsoShareLink) result += `\n${window.location.href}`
    return result
  }, [alsoShareLink, loading, puzzle, maxFails, state, puzzleNumber, rowResults])

  let [newSecret, setNewSecret] = useState("")
  let [newMaxFails, setNewMaxFails] = useState(6)
  let newUrl = useMemo(()=>{
    if (!newSecret) return undefined
    return window.location.origin + location.pathname + "?" + new URLSearchParams({
      a: cipher(newSecret),
      g: clamp(newMaxFails,1).toString()
    })
  }, [location.pathname, newSecret, newMaxFails])

  const [showCurrCopied, setShowCurrCopied] = useState(false);
  const handleCurrCopiedTipClose = () => {setShowCurrCopied(false)}
  const copyUrl = (url: string) => {
    if (copyToClipboard(url)) {
      setShowCurrCopied(true)
      setTimeout(handleCurrCopiedTipClose, 500)
    }
  }

  const [showNewCopied, setShowNewCopied] = useState(false);
  const handleNewCopiedTipClose = () => {setShowNewCopied(false)}
  const copyNewUrl = () => {
    if (!newUrl) return
    if (copyToClipboard(newUrl)) {
      setShowNewCopied(true)
      setTimeout(handleNewCopiedTipClose, 500)
    }
  }

  function guess(word: string) {
    if (state !== "") return // Game is over
    word = word.toUpperCase()
    for (let guess in guesses) {
      if (guess === word) return // Already Guessed
      // TODO: Show error of already guessed
    }
    setGuesses(guesses.concat([word]))
  }

  function resetScroll() {
    window.scrollTo(0,0)
    gameRef?.current?.focus()
  }

  function goRandom() {
    let phrase = Math.floor(Math.random() * phrases.length)
    let url = location.pathname + "?" + new URLSearchParams({ n: phrase.toString() })
    navigate(url)
    resetScroll()
  }

  function handleKeydown(event: React.KeyboardEvent) {
    if (event.key.length !== 1) return // May be "Dead" or other special values
    if (event.key >= 'A' && event.key <= 'Z') guess(event.key)
    if (event.key >= 'a' && event.key <= 'z') guess(event.key)
    if (event.key === ' ') event.preventDefault()
  }

  useEffect(()=>{

  })

  const saveKey = "hangman"
  let [puzzleToSave, puzzleNumberToSave] = useMemo(()=>{
    let saveData = loadPuzzleData(puzzle, puzzleNumber, day, saveKey)
    if (saveData) {
      let guessed = getProp( saveData, "guessed", {})
      console.log("guessed: ", Object.entries(guessed))
      setGuessed(guessed)
      // Reveal what's been guessed
      setRevealed(puzzle.split("").map((c: string) => {
        if (!alpha.includes(c)) return c
        let g = getProp(guessed, c.toUpperCase(), undefined)
        if (g === 1 || g === -1) return c
        return undefined
      }))
      // Total up failures
      setFails(Object.entries(guessed).reduce((total,[_,val]) => val === -1 ? total+1 : total, 0))
    }
    else {
      // Reset everything for a fresh start
      setGuessed({})
      setRevealed(puzzle.split("").map((c: string) => {
        if (!alpha.includes(c)) return c
        return undefined
      }))
      setFails(0)
    }
    return [puzzle, puzzleNumber]
  }, [puzzle, puzzleNumber])

  useEffect(() => {
    if (Object.entries(guesses).length > 0) savePuzzleData({guesses}, puzzleToSave, puzzleNumberToSave, day, saveKey)
  }, [guesses, puzzleToSave, puzzleNumberToSave])

  return (
    <Box className="content">
      <Box ref={gameRef} onKeyDown={handleKeydown} tabIndex={0} className="game" sx={{display:"flex", flexDirection:"column", outline: "0px solid transparent"}}>
        <Box className="hbox" sx={{alignItems: "center"}}>
          <img src="/hangman_icon.svg" alt='' style={{height: "3rem", marginRight: "8px"}}/>
          <Typography variant="h2">Hangman</Typography>
        </Box>
        <Typography>Classic hangman rules. Guess letters. If its the right letter, the letter will be filled in. If you guess wrong, you get one step closer to failure.</Typography>

        <Box sx={{display:"flex", flexDirection:"column", justifyContent:"center", mt:"auto", mb:"auto"}}>
          {/* Display */}
          <Box>
            <Typography variant="h4" sx={{fontFamily:"monospace", letterSpacing:"4px", color: state === "success" ? "green" : state === "fail" ? "red" : ""}}>
              {revealed.map( c => (c ?? "_")).join("")}
            </Typography>
            {state === "" ?
              <Typography variant="h6">&nbsp;</Typography>
              : state === "success" ?
                <Typography variant="h6" sx={{color: "green"}}>SUCCESS!</Typography>
                :
                <Typography variant="h6" sx={{color: "red"}}>FAILURE</Typography>
            }
          </Box>
          {/* Results */}
          <Typography variant="h6" sx={{opacity: "50%", mb: "12px"}}>
            {resultString}
          </Typography>
          {/* Keyboard */}
          {state === "" ?
            <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
              {keyboardUpper.map((row, r) =>
                <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                  {row.map(key => {
                    let g = getProp(guessed,key,0)
                    return (
                      <Button key={key} variant="outlined" disabled={ g !== 0} onClick={()=>guess(key)}
                              sx={{width:"2em", minWidth:"2em", flex:"0 0", backgroundColor: g === 1 ? "darkgreen" : ""}}>
                        {key}
                      </Button>
                    )
                  })}
                </Box>
              )}
            </Box>
            :
            <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
              {keyboardUpper.map((row,r) =>
                <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                  {row.map(key => {
                    let g = getProp(guessed,key,0)
                    return (
                      <Button key={key} variant="outlined" disabled={true} onClick={()=>{}}
                              sx={{width:"2em", minWidth:"2em", flex:"0 0", backgroundColor: g === 1 ? "darkgreen" : puzzle.includes(key) || puzzle.includes(key.toLocaleLowerCase()) ? "#002200" : g === -1 ? "#220000" : ""}}>
                        {key}
                      </Button>
                    )
                  })}
                </Box>
              )}
            </Box>
          }
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" sx={{textTransform: "uppercase"}}>Share</Typography>
        <ClickAwayListener onClickAway={handleCurrCopiedTipClose}>
          <div>
            <Tooltip PopperProps={{ disablePortal: true, }} onClose={handleCurrCopiedTipClose} open={showCurrCopied} disableFocusListener disableHoverListener disableTouchListener title="Copied!" >
              { state === "" ?
                alsoShareLink ?
                  <Button variant="outlined" onClick={()=>copyUrl(window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>{window.location.href}</Button>
                  : <Button variant="outlined" onClick={()=>{}} endIcon={<CopyIcon/>} disabled sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Puzzle Incomplete</Button>
                : puzzleNumber !== -1 ?
                  alsoShareLink ?
                    <Button variant="outlined" onClick={()=>copyUrl("Hangman #"+puzzleNumber+": "+resultString+" "+window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman #{puzzleNumber}: {resultString} {window.location.href}</Button>
                    : <Button variant="outlined" onClick={()=>copyUrl("Hangman #"+puzzleNumber+": "+resultString)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman #{puzzleNumber}: {resultString}</Button>
                  : alsoShareLink ?
                    <Button variant="outlined" onClick={()=>copyUrl("Hangman Score: "+resultString+" "+window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman Score: {resultString} {window.location.href}</Button>
                    : <Button variant="outlined" onClick={()=>copyUrl("Hangman Score: "+resultString)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman Score: {resultString}</Button>
              }
            </Tooltip>
          </div>
        </ClickAwayListener>
        <FormControlLabel label="Include Link" control={<Checkbox checked={alsoShareLink} onChange={(e)=>setAlsoShareLink(e.target.checked)} />} />
      </Box>

      <hr style={{margin:"24px 0px"}}/>

      <Box className="vbox" sx={{display:"flex", flexDirection:"column"}}>
        <Typography variant="h5" sx={{textTransform: "uppercase"}}>New Puzzle</Typography>
        <Box className="hbox">
          <Button component={Link} to="/hangman" variant="outlined" onClick={resetScroll} endIcon={<NorthEastIcon/>} disabled={puzzleNumber===day} sx={{mb:"8px", textTransform: "uppercase"}}>Today</Button>
          <Button variant="outlined" onClick={goRandom} endIcon={<NorthEastIcon/>} sx={{mb:"8px", textTransform: "uppercase"}}>Random Day</Button>
        </Box>
        <Typography>Create your own</Typography>
        <form className="hbox">
          <TextField label="Max Fails" type="number" value={newMaxFails} onChange={(e)=>setNewMaxFails(Number.parseInt(e.target.value))} sx={{width:"5em"}}/>
          <TextField label="Answer" value={newSecret} onChange={(e)=>setNewSecret(e.target.value)}/>
        </form>
        <Box className="hbox" sx={{alignItems: "center"}}>
          {newUrl ?
            <>
              <Button component={Link} to={newUrl} variant="outlined" endIcon={<NorthEastIcon/>} onClick={resetScroll} sx={{textTransform:"none",lineBreak:"anywhere"}}>{newUrl}</Button>
              <ClickAwayListener onClickAway={handleNewCopiedTipClose}>
                <div>
                  <Tooltip PopperProps={{ disablePortal: true, }} onClose={handleNewCopiedTipClose} open={showNewCopied} disableFocusListener disableHoverListener disableTouchListener title="Copied!" >
                    <IconButton aria-label="copy" onClick={copyNewUrl}><CopyIcon/></IconButton>
                  </Tooltip>
                </div>
              </ClickAwayListener>
            </>
            :
            <>
              <Button variant="outlined" endIcon={<NorthEastIcon/>} sx={{textTransform:"none"}} disabled>Invalid</Button>
              <IconButton aria-label="copy" onClick={()=>{}} disabled><CopyIcon/></IconButton>
            </>
          }
        </Box>
      </Box>
    </Box>
  );
}

export default Yordle;