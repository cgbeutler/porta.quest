import { Box, Button, Checkbox, ClickAwayListener, FormControlLabel, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { phrases } from "./Phrases";
import CopyIcon from '@mui/icons-material/ContentCopy';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { clamp } from "../../lib/helpers/MathHelpers";
import { loadPuzzleData, savePuzzleData } from "../../lib/PuzzleData";
import { getProp } from "../../lib/helpers/ObjectHelpers";
import { copyToClipboard } from "../../lib/helpers/ClipboardHelpers";
import {alpha, keyboardUpper} from "../../lib/helpers/AlphabetHelpers";
import {cipher, decipher} from "../../lib/helpers/CipherHelpers";
import {daysSince} from "../../lib/helpers/DateHelpers";
import { useSettings } from "../../lib/SettingsProvider";
import "./hangman.css"
import { chunk } from "../../lib/helpers/StringHelpers";

const day = daysSince(2024, 9, 10)
 
const Hangman: FunctionComponent = () => {
  const settings = useSettings();
  let [searchParams] = useSearchParams()
  let location = useLocation()
  let navigate = useNavigate()
  let gameRef = useRef<HTMLElement>()

  let [puzzle, puzzleNumber, maxFails] = useMemo(() => {
    let guesses = Number.parseInt(searchParams.get("g") ?? "6")??6
    let cipheredPuzzle = searchParams.get("a")
    if (cipheredPuzzle) {
      return [decipher(cipheredPuzzle), -1, guesses]
    }
    let puzzleNumberRaw = searchParams.get("n")
    let puzzleNumber = puzzleNumberRaw ? Number.parseInt(puzzleNumberRaw) : NaN;
    if (!Number.isInteger(puzzleNumber)) puzzleNumber = day
    let index = puzzleNumber % phrases.length
    if (index < 0) index += phrases.length
    return [phrases[index], puzzleNumber, guesses]
  }, [searchParams])

  let [guessed, setGuessed] = useState<{[key:string]:undefined|1|-1}>({})
  let [scorecard, setScorecard] = useState<string>("")
  let [revealed, setRevealed] = useState<(string|undefined)[]>([])
  let [fails, setFails] = useState(0)
  let state: ""|"success"|"fail" = useMemo(() => {
    if (revealed.some((c: string|undefined) => c === undefined)) {
      if (fails >= maxFails) return "fail"
      return ""
    }
    return "success"
  }, [fails, maxFails, revealed])
  let livesDisplay = useMemo(() => Array.from({length: maxFails}).map( (_,i) => i < fails ? "💀" : "💙").join(""),
    [fails, maxFails]
  )
  let scorecardShareStr = useMemo(() => {
    let result: string[] = [...chunk(scorecard, 12)]
    let resultStr: string = result.join("\n")
    if (state === "success" && !resultStr.includes("💀") && resultStr.includes("💙")) {
      resultStr = resultStr.replaceAll("💙", "💛")
    }
    return resultStr
  }, [state, scorecard])
  
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

  function guess(letter: string) {
    if (state !== "") return // Game is over
    letter = letter.toUpperCase()
    let g = getProp(guessed, letter, undefined)
    if (g !== undefined) return // Already Guessed
    let newRevealed = [...revealed];
    let found = false
    puzzle.split("").forEach((v,i) => {
      if (v.toUpperCase() === letter) {
        newRevealed[i] = v
        found = true
      }
    })
    setGuessed({...guessed, [letter]: found ? 1 : -1})
    if (!found) setFails(fails+1)
    else setRevealed(newRevealed)
    setScorecard(scorecard + (found ? "💙" : "💀"))
  }

  function resetScroll() {
    window.scrollTo(0,0)
    gameRef?.current?.focus()
  }

  function goRandom() {
    let phrase = Math.floor(Math.random()*phrases.length)
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
    gameRef?.current?.focus()
  }, [])

  const saveKey = "hangman"
  let [puzzleToSave, puzzleNumberToSave] = useMemo(()=>{
    let saveData = loadPuzzleData(puzzle, puzzleNumber, day, saveKey)
    if (saveData) {
      let guessed = getProp( saveData, "guessed", {})
      setGuessed(guessed)
      let scorecard = getProp( saveData, "scorecard", {})
      setScorecard(scorecard)
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
      setScorecard("")
      setRevealed(puzzle.split("").map((c: string) => {
        if (!alpha.includes(c)) return c
        return undefined
      }))
      setFails(0)
    }
    return [puzzle, puzzleNumber]
  }, [puzzle, puzzleNumber])

  useEffect(() => {
    if (Object.entries(guessed).length > 0) savePuzzleData({guessed, scorecard}, puzzleToSave, puzzleNumberToSave, day, saveKey)
  }, [guessed, scorecard, puzzleToSave, puzzleNumberToSave])

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
            <Typography variant="h4" className={`${state}`} sx={{fontFamily:"monospace", letterSpacing:"4px"}}>
              {revealed.map( c => (c ?? "_")).join("")}
            </Typography>
            <Typography variant="h6" className={`${state}`}>
              {state === "" ? "" : state === "success" ? "SUCCESS!" : "FAILURE"}
            </Typography>
          </Box>
          {/* Results */}
          <Typography variant="h6" sx={{opacity: "50%", mb: "12px"}}>
            {livesDisplay}
          </Typography>
          {/* Keyboard */}
          {state === "" ?
            <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
              {keyboardUpper.map((row, r) =>
                <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                  {row.map(key => {
                    let g = getProp(guessed,key,0)
                    return (
                      <Button key={key} variant="outlined"
                        disabled={ g !== 0} onClick={()=>guess(key)}
                        className={`keyboard-button ${g === 1 ? "success" : ""}`}
                        sx={{width:"2em", minWidth:"2em", flex:"0 0"}}
                      >
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
                      <Button key={key} variant="outlined"
                        disabled={true} onClick={()=>{}}
                        className={`keyboard-button ${g === 1 ? "success" : puzzle.includes(key) || puzzle.includes(key.toLocaleLowerCase()) ? "missed" : g === -1 ? "fail" : ""}`}
                        sx={{width:"2em", minWidth:"2em", flex:"0 0"}}
                      >
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
                settings.value.alsoShareLink ?
                  <Button variant="outlined" onClick={()=>copyUrl(window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>{window.location.href}</Button>
                : <Button variant="outlined" onClick={()=>{}} endIcon={<CopyIcon/>} disabled sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Puzzle Incomplete</Button>
              : puzzleNumber !== -1 ?
                settings.value.alsoShareLink ?
                  <Button variant="outlined" onClick={()=>copyUrl("Hangman #"+puzzleNumber+":\n"+scorecardShareStr+"\n"+window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman #{puzzleNumber}:<br/>{scorecardShareStr.split("\n").map(s=><>{s}<br/></>)}{window.location.href}</Button>
                : <Button variant="outlined" onClick={()=>copyUrl("Hangman #"+puzzleNumber+":\n"+scorecardShareStr)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman #{puzzleNumber}:<br/>{scorecardShareStr.split("\n").map(s=><>{s}<br/></>)}</Button>
              : settings.value.alsoShareLink ?
                <Button variant="outlined" onClick={()=>copyUrl("Hangman Score:\n"+scorecardShareStr+"\n"+window.location.href)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman Score:<br/>{scorecardShareStr.split("\n").map(s=><>{s}<br/></>)}{window.location.href}</Button>
              : <Button variant="outlined" onClick={()=>copyUrl("Hangman Score:\n"+scorecardShareStr)} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>Hangman Score:<br/>{scorecardShareStr.split("\n").map(s=><>{s}<br/></>)}</Button>
              }
            </Tooltip>
          </div>
        </ClickAwayListener>
        <FormControlLabel label="Include Link" control={<Checkbox checked={settings.value.alsoShareLink} onChange={(e)=>settings.update({alsoShareLink: e.target.checked})} />} />
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
 
export default Hangman;