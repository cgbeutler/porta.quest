import "./tordle.css"
import CopyIcon from '@mui/icons-material/ContentCopy';
// import NorthEastIcon from '@mui/icons-material/NorthEast';
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  // IconButton,
  // TextField,
  Tooltip,
  Typography
} from "@mui/material";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { /*Link, useLocation, useNavigate,*/ useSearchParams } from "react-router-dom";
import { getNDictionary, getNDictionaryCommon, NDictionary } from "../../lib/NDictionary";
import { alphaLower, alphaUpper, keyboardUpper } from "../../lib/helpers/AlphabetHelpers";
import { /*cipher,*/ decipher } from "../../lib/helpers/CipherHelpers";
import { copyToClipboard } from "../../lib/helpers/ClipboardHelpers";
import { daysSince } from "../../lib/helpers/DateHelpers";
// import { clamp } from "../../lib/helpers/MathHelpers";
import { getProp } from "../../lib/helpers/ObjectHelpers";
import { loadPuzzleData, savePuzzleData } from "../../lib/PuzzleData";
import { replaceAt } from '../../lib/helpers/StringHelpers';
import { useSettings } from "../../lib/SettingsProvider";

const HIT = "🟦"
const ALMOST = "🟨"
const MISS = "⬛"
const day = daysSince(2024, 9, 10)

const Tordle: FunctionComponent = () => {
  const [searchParams] = useSearchParams()
  // const location = useLocation()
  // const navigate = useNavigate()
  const settings = useSettings();
  const gameRef = useRef<HTMLElement>()

  const [loading, setLoading] = useState(true)
  const [dictionary, setDictionary] = useState<NDictionary|undefined>()
  const [puzzle, setPuzzle] = useState<string|undefined>()
  const [yesterdaysPuzzle, setYesterdaysPuzzle] = useState<string|undefined>()
  const [puzzleNumber, setPuzzleNumber] = useState<number|undefined>()
  const [maxFails, setMaxFails] = useState<number|undefined>()
  const [currGuess, setCurrGuess] = useState<string>("")
  const [guessError, setGuessError] = useState<string>(" ")
  const [guesses, setGuesses] = useState<string[]>([])

  useEffect(() => {
    setLoading(true)
    // See if we have a specific puzzle
    let newMaxFails = Number.parseInt(searchParams.get("g") ?? "6")??6
    let cipheredPuzzle = searchParams.get("a")
    if (cipheredPuzzle) {
      // Load puzzle from query string
      const clearPuzzle = decipher(cipheredPuzzle)
      try {
        getNDictionary(clearPuzzle.length).then(d => {
          setDictionary(d)
          setPuzzle(clearPuzzle.toUpperCase())
          setPuzzleNumber(-1)
          setMaxFails(newMaxFails)
          setLoading(false)
          gameRef?.current?.focus()
        })
      } catch (err) {
        console.error(`error loading dictionary: ${err}`)
        setDictionary(undefined)
        setPuzzle(undefined)
        setPuzzleNumber(undefined)
        setMaxFails(undefined)
        setLoading(false)
      }
      return
    }
    // Load the day-number's puzzle
    let puzzleNumberRaw = searchParams.get("n")
    let puzzleNumber = puzzleNumberRaw ? Number.parseInt(puzzleNumberRaw) : NaN;
    // If no number, use today's puzzle
    if (!Number.isInteger(puzzleNumber)) puzzleNumber = day
    getNDictionary(5).then(d => {
      getNDictionaryCommon(5).then(dc => {
        const puzzle = dc.pseudorandomWord(puzzleNumber)
        const yesterday = dc.pseudorandomWord(puzzleNumber - 1)
        setDictionary(d)
        setPuzzle(puzzle.toUpperCase())
        setYesterdaysPuzzle(yesterday.toUpperCase())
        setPuzzleNumber(puzzleNumber)
        setMaxFails(newMaxFails)
        setLoading(false)
        gameRef?.current?.focus()
      })
    }).catch((err) => {
      console.error(`error loading dictionary: ${err}`)
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

  let rowResults = useMemo<string[][]>(() => {
    if (loading || !puzzle || !maxFails) return []
    const results: string[][] = []
    for (let gi = 0; gi < guesses.length; gi++) {
      let guess = guesses[gi]
      let rowResult: string[] = Array(puzzle.length).fill(MISS)
      let puzzleCopy = puzzle
      for (let li = 0; li < guess.length; li++) {
        const letter = guess[li]
        if (puzzleCopy[li] === letter) {
          rowResult[li] = HIT
          puzzleCopy = replaceAt(puzzleCopy, li, '!')
        }
      }
      for (let li = 0; li < guess.length; li++) {
        const letter = guess[li]
        if (puzzleCopy.includes(letter)) {
          rowResult[li] = ALMOST
          let index = puzzleCopy.indexOf(letter)
          puzzleCopy = replaceAt(puzzleCopy, index, '!')
        }
      }
      results.push(rowResult)
    }
    return results
  }, [loading, guesses, puzzle, maxFails])

  let guessedLetters = useMemo<{[key:string]: string}>(() => {
    if (loading || !puzzle || !maxFails) return {}
    const results: {[key:string]: string} = Object.fromEntries(alphaUpper.map(l => [l, ""]))
    for (let gi = 0; gi < guesses.length; gi++) {
      let guess = guesses[gi]
      let puzzleCopy = puzzle
      for (let li = 0; li < guess.length; li++) {
        const letter = guess[li]
        if (puzzleCopy[li] === letter) {
          results[letter] = HIT
          puzzleCopy = replaceAt(puzzleCopy, li, '!')
        }
      }
      for (let li = 0; li < guess.length; li++) {
        const letter = guess[li]
        if (puzzleCopy.includes(letter)) {
          if (results[letter] === "") results[letter] = ALMOST
          let index = puzzleCopy.indexOf(letter)
          puzzleCopy = replaceAt(puzzleCopy, index, '!')
        }
        else if (!puzzle.includes(letter)) {
          results[letter] = MISS
        }
      }
    }
    return results
  }, [loading, guesses, puzzle, maxFails])

  let resultString = useMemo(() => {
    if (loading || !puzzle || !maxFails || state === "") return ""
    let rowResultStrings = rowResults.map((row,r) => yesterdaysPuzzle && r === 0 ? "(" + row.join("") + ")" : row.join("")).join("\n")
    let result = `Tordle #${puzzleNumber} ${yesterdaysPuzzle ? rowResults.length - 1 : rowResults.length}/${yesterdaysPuzzle ? maxFails - 1 : maxFails}\n${rowResultStrings}`
    if (state === "fail") result += "💀"
    if (state === "success") {
      if ((yesterdaysPuzzle && guesses.length > 2) || (!yesterdaysPuzzle && guesses.length > 1)) result += "💙"
      else result += "💛"
    }
    if (settings.value.alsoShareLink) result += `\n${window.location.href}`
    return result
  }, [settings.value.alsoShareLink, loading, puzzle, maxFails, state, puzzleNumber, rowResults, guesses, yesterdaysPuzzle])

  // let [newSecret, setNewSecret] = useState("")
  // let [newMaxFails, setNewMaxFails] = useState(6)
  // let newUrl = useMemo(()=>{
  //   if (!newSecret) return undefined
  //   return window.location.origin + location.pathname + "?" + new URLSearchParams({
  //     a: cipher(newSecret),
  //     g: clamp(newMaxFails,1).toString()
  //   })
  // }, [location.pathname, newSecret, newMaxFails])

  const [showCurrCopied, setShowCurrCopied] = useState(false);
  const handleCurrCopiedTipClose = () => {setShowCurrCopied(false)}
  const copyUrl = (url: string) => {
    if (copyToClipboard(url)) {
      setShowCurrCopied(true)
      setTimeout(handleCurrCopiedTipClose, 500)
    }
  }

  // const [showNewCopied, setShowNewCopied] = useState(false);
  // const handleNewCopiedTipClose = () => {setShowNewCopied(false)}
  // const copyNewUrl = () => {
  //   if (!newUrl) return
  //   if (copyToClipboard(newUrl)) {
  //     setShowNewCopied(true)
  //     setTimeout(handleNewCopiedTipClose, 500)
  //   }
  // }

  function addLetter(letter: string) {
    if (puzzle == null) return
    if (state !== "") return // Game is over
    if (currGuess.length >= puzzle.length) return
    const newGuess = currGuess + letter.toUpperCase()
    setCurrGuess(newGuess)
    gameRef?.current?.focus()
  }

  function removeLetter() {
    if (puzzle == null) return
    if (state !== "") return // Game is over
    if (currGuess.length === 0) return
    setGuessError(" ")
    const newGuess = currGuess.slice(0,-1)
    setCurrGuess(newGuess)
    gameRef?.current?.focus()
  }

  function enterGuess() {
    if (puzzle == null) return
    if (state !== "") return // Game is over
    if (currGuess.length !== puzzle.length) return
    for (let gi = 0; gi < guesses.length; gi++) {
      if (guesses[gi] === currGuess) {
        setGuessError("Already Guessed")
        gameRef?.current?.focus()
        return
      }
    }
    if (!dictionary?.containsWord(currGuess)) {
      setGuessError("Word not in Dictionary")
      gameRef?.current?.focus()
      return
    }
    setGuesses(guesses.concat([currGuess]))
    setCurrGuess("")
    gameRef?.current?.focus()
  }

  // function resetScroll() {
  //   window.scrollTo(0,0)
  //   gameRef?.current?.focus()
  // }

  // function goRandom() {
  //   let phrase = Math.floor(Math.random() * NUM_COMMON_WORDS)
  //   let url = location.pathname + "?" + new URLSearchParams({ n: phrase.toString() })
  //   navigate(url)
  //   resetScroll()
  // }

  function handleKeydown(event: React.KeyboardEvent) {
    if (alphaUpper.includes(event.key as any)) addLetter(event.key)
    else if (alphaLower.includes(event.key as any)) addLetter(event.key)
    else if (event.key === 'Backspace') removeLetter()
    else if (event.key === 'Enter') { enterGuess(); event.preventDefault() }
    else if (event.key === ' ') event.preventDefault()
    gameRef?.current?.focus()
  }

  const saveKey = "tordle"
  let [puzzleToSave, puzzleNumberToSave] = useMemo(()=>{
    if (loading || !puzzle) return [undefined, undefined]
    let saveData = loadPuzzleData(puzzle, puzzleNumber, day, saveKey)
    if (saveData) {
      let guesses = getProp( saveData, "guesses", [])
      setGuesses(guesses)
    }
    else {
      // Reset everything for a fresh start
      if (yesterdaysPuzzle) setGuesses([yesterdaysPuzzle])
      else setGuesses([])
    }
    return [puzzle, puzzleNumber]
  }, [loading, puzzle, yesterdaysPuzzle, puzzleNumber])

  useEffect(() => {
    if (loading || !puzzleToSave || !puzzleNumberToSave) return
    if (Object.entries(guesses).length > 1) savePuzzleData({guesses}, puzzleToSave, puzzleNumberToSave, day, saveKey)
  }, [loading, guesses, puzzleToSave, puzzleNumberToSave])

  useEffect(()=>{
    gameRef?.current?.focus()
  }, [])

  return (
    <Box className="content">
      {loading ?
        <Typography>Loading</Typography>
      :
        <>
          <Box ref={gameRef} onKeyDown={handleKeydown} tabIndex={0} className="game" sx={{display:"flex", flexDirection:"column", outline: "0px solid transparent"}}>
            <Box className="hbox" sx={{alignItems: "center"}}>
              <img src="/tordle_icon.svg" alt='' style={{height: "3rem", marginRight: "8px"}}/>
              <Typography variant="h2">Tordle</Typography>
            </Box>
            <Typography>Same rules as Wordle, but each day starts with yesterday's word.</Typography>

            <Box sx={{display:"flex", flexDirection:"column", justifyContent:"center", mt:"auto", mb:"auto"}}>
              {/* Display */}
              <Box sx={{display:"flex", flexDirection:"column", gap: "8px"}}>
                {[...Array(maxFails)].map( (_, i) =>
                  <div key={i} style={{display:"flex", flexDirection:"row", justifyContent:"center", gap:"8px", alignItems:"center"}}>
                    {i < rowResults.length ?
                      [...Array(puzzle?.length ?? 1)].map( (_, j) => {
                        let result = rowResults[i][j]
                        return <div key={j} className={`result-box ${result === HIT ? "hit" : result === ALMOST ? "almost" : result === MISS ? "miss" : ""}`}>{guesses[i][j]?.toUpperCase()}</div>
                      })
                    : i === rowResults.length ?
                      [...Array(puzzle?.length ?? 0)].map( (_, j) =>
                        <div key={j} className="result-box current">{currGuess[j]}</div>
                      )
                    :
                      [...Array(puzzle?.length ?? 0)].map( (_, j) =>
                        <div key={j}  className="result-box upcoming"></div>
                      )
                    }
                  </div>
                )}
                {state === "" ?
                  <Typography variant="h6">&nbsp;</Typography>
                : state === "success" ?
                  <Typography variant="h6" className="success" sx={{color: "green"}}>SUCCESS!</Typography>
                :
                  <Typography variant="h6" className="fail" sx={{color: "red"}}>FAILURE</Typography>
                }
              </Box>
              <Typography variant="h6">{guessError}</Typography>
              {/* Keyboard */}
              {state === "" ?
                <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
                  {keyboardUpper.map((row, r) =>
                    <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                      { r !== 2 ? undefined :
                        <Button variant="outlined" color="secondary" onClick={removeLetter}
                                sx={{width:"5em", minWidth:"5em", flex:"0 0"}}>
                          ⌫
                        </Button>
                      }
                      {row.map(key =>
                        <Button className={`keyboard-button ${guessedLetters[key] === HIT ? "hit" : guessedLetters[key] === ALMOST ? "almost" : guessedLetters[key] === MISS ? "miss" : ""}` } key={key} variant="outlined" onClick={()=>addLetter(key)}
                                sx={{width:"2em", minWidth:"2em", flex:"0 0"}}>
                          {key}
                        </Button>
                      )}
                      { r !== 2 ? undefined :
                        <Button className="keyboard-button" variant="outlined" disabled={currGuess.length !== puzzle?.length} onClick={enterGuess}
                                sx={{width:"4.5em", minWidth:"5em", flex:"0 0", fontWeight: "bold"}}>
                          Enter
                        </Button>
                      }
                    </Box>
                  )}
                </Box>
                :
                <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
                  {keyboardUpper.map((row,r) =>
                    <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                      {row.map(key =>
                        <Button key={key} variant="outlined" disabled={true} onClick={()=>{}}
                                className={`keyboard-button ${guessedLetters[key] === HIT ? "hit" : guessedLetters[key] === ALMOST ? "almost" : guessedLetters[key] === MISS ? "miss" : ""}` }
                                sx={{width:"2em", minWidth:"2em", flex:"0 0"}}>
                          {key}
                        </Button>
                      )}
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
                    settings.value.alsoShareLink ?
                      <Button variant="outlined" onClick={()=>copyUrl(window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere",textAlign:"left"}}>{window.location.href}</Button>
                      : <Button variant="outlined" onClick={()=>{}} endIcon={<CopyIcon/>} disabled sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere",textAlign:"left"}}>Puzzle Incomplete</Button>
                    : <Button variant="outlined" onClick={()=>copyUrl(resultString)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere",textAlign:"left"}}>{resultString.split("\n").map(s=><>{s}<br/></>)}</Button>
                  }
                </Tooltip>
              </div>
            </ClickAwayListener>
            <FormControlLabel label="Include Link" control={<Checkbox checked={settings.value.alsoShareLink} onChange={(e)=>settings.update({alsoShareLink: e.target.checked})} />} />
          </Box>
        </>
      }

      {/* <hr style={{margin:"24px 0px"}}/>

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
      </Box> */}
    </Box>
  );
}

export default Tordle;