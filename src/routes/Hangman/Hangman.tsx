import { Box, Button, ClickAwayListener, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { phrases } from "./Phrases";
import CopyIcon from '@mui/icons-material/ContentCopy';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { clamp } from "../../lib/helpers/MathHelpers";

const alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const alphaChars = [...alpha,...alpha.map(c => c.toLocaleLowerCase())]
function _shift( s: string, d: 1|-1 ) {
  let result = s.split("").map( (c, c_i) => {
    let original_i = alphaChars.indexOf(c)
    if (original_i < 0) return c
    let new_i = (original_i + d*((c_i%2?-1:1)*13 + c_i)) % alphaChars.length
    if (new_i < 0) new_i += alphaChars.length
    console.log(alphaChars[new_i])
    return alphaChars[new_i]
  } ).join("")
  return result
}
function cipher( s: string ) { return _shift(s, 1) }
function decipher( s: string ) { return _shift(s, -1) }

const keyboard = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  [ "A","S","D","F","G","H","J","K","L"],
  [     "Z","X","C","V","B","N","M"],
]
 
const Hangman: FunctionComponent = () => {
  let [searchParams, setSearchParams] = useSearchParams()
  let location = useLocation()
  let navigate = useNavigate()
  let gameRef = useRef<HTMLElement>()
  let secret = useMemo(() => {
    return decipher(searchParams.get("a")??"")
  }, [searchParams])
  let maxFails = useMemo(() => {
    return Number.parseInt(searchParams.get("g") ?? "6")??6
  }, [searchParams])
  let [guessed, setGuessed] = useState<{[key:string]:""|"good"|"bad"}>({})
  let [revealed, setRevealed] = useState<(string|undefined)[]>([])
  let [fails, setFails] = useState(0)
  let state: ""|"success"|"fail" = useMemo(() => {
    if (revealed.some(c => c === undefined)) {
      if (fails >= maxFails) return "fail"
      return ""
    }
    return "success"
  }, [fails, maxFails, revealed])
  
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
  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowCurrCopied(true)
    setTimeout(handleCurrCopiedTipClose, 500)
  }
  
  const [showNewCopied, setShowNewCopied] = useState(false);
  const handleNewCopiedTipClose = () => {setShowNewCopied(false)}
  const copyNewUrl = () => {
    if (!newUrl) return
    setShowNewCopied(true)
    navigator.clipboard.writeText(newUrl)
    setTimeout(handleNewCopiedTipClose, 500)
  }

  function guess(letter: string) {
    if (state !== "") return // Game is over
    letter = letter.toUpperCase()
    if (Object.hasOwn(guessed, letter) && ["good","bad"].includes(guessed[letter])) return // Already Guessed
    let newRevealed = [...revealed];
    let found = false
    secret.split("").forEach((v,i) => {
      if (v.toUpperCase() === letter) {
        newRevealed[i] = v
        found = true
      }
    })
    setGuessed({...guessed, [letter]: found ? "good" : "bad"})
    if (!found) setFails(fails+1)
    else setRevealed(newRevealed)
  }

  // function handleSubmit(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   if (!newSecret) return;
  //   setSearchParams({a: cipher(newSecret), g: newMaxFails.toString()});
  // }

  function goRandom() {
    let phrase = phrases[Math.floor(Math.random()*phrases.length)]
    let url = location.pathname + "?" + new URLSearchParams({
      a: cipher(phrase),
      g: clamp(newMaxFails,1).toString()
    })
    navigate(url)
    window.scrollTo(0,0)
    gameRef?.current?.focus()
  }
  
  function handleKeydown(event: React.KeyboardEvent) {
    if (event.key.length !== 1) return // May be "Dead" or other special values
    if (event.key >= 'A' && event.key <= 'Z') guess(event.key)
    if (event.key >= 'a' && event.key <= 'z') guess(event.key)
    if (event.key === ' ') event.preventDefault()
  }

  useEffect(()=>{
    if (!searchParams.get("a")) {
      let phrase = phrases[Math.floor(Math.random()*phrases.length)]
      setSearchParams({a: cipher(phrase), g: "6"})
    }
  })

  useEffect(()=>{
    setGuessed(Object.fromEntries(alpha.map(v => [v, ""])))
    setRevealed(secret.split("").map(c => {
      if (alphaChars.includes(c)) return undefined
      return c
    }))
    setFails(0)
  }, [secret])

  return (
    <Box className="content">
      <Box ref={gameRef} onKeyDown={handleKeydown} tabIndex={0} className="game" sx={{display:"flex", flexDirection:"column", outline: "0px solid transparent"}}>
        <Typography variant="h2">Hangman</Typography>
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
          {/* Keyboard */}
          {state === "" ?
            <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
              {keyboard.map((row, r) =>
                <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                  {row.map(key => (
                    <Button key={key} variant="outlined" disabled={guessed[key] !== ""} onClick={()=>guess(key)}
                      sx={{width:"2em", minWidth:"2em", flex:"0 0", backgroundColor: guessed[key] === "good" ? "darkgreen" : ""}}>
                        {key}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          :
            <Box sx={{display:"flex", flexDirection:"column", flexWrap:"nowrap", alignItems:"center", gap: "4px"}}>
              {keyboard.map((row,r) =>
                <Box key={r} sx={{display:"flex", flexDirection:"row", flexWrap:"nowrap", justifyContent:"center", gap: "4px"}}>
                  {row.map(key => (
                    <Button key={key} variant="outlined" disabled={true} onClick={()=>{}}
                      sx={{width:"2em", minWidth:"2em", flex:"0 0", backgroundColor: guessed[key] === "good" ? "darkgreen" : secret.includes(key) || secret.includes(key.toLocaleLowerCase()) ? "#002200" : guessed[key] === "bad" ? "#220000" : ""}}>
                        {key}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          }
          <Typography variant="h6" sx={{opacity: "50%"}}>
            {Array.from({length: maxFails}).map( (_,i) => (
                  <span key={i}>{i < fails ? "💀" : " ● "}</span>
                ))}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="h5">SHARE</Typography>
        <ClickAwayListener onClickAway={handleCurrCopiedTipClose}>
          <div>
            <Tooltip PopperProps={{ disablePortal: true, }} onClose={handleCurrCopiedTipClose} open={showCurrCopied} disableFocusListener disableHoverListener disableTouchListener title="Copied!" >
              <Button variant="outlined" onClick={copyCurrentUrl} endIcon={<CopyIcon/>} sx={{textTransform:"none",overflow:"hidden",lineBreak:"anywhere"}}>{window.location.href}</Button>
            </Tooltip>
          </div>
        </ClickAwayListener>
      </Box>

      <hr style={{margin:"24px 0px"}}/>

      <Box className="vbox" sx={{display:"flex", flexDirection:"column"}}>
        <Typography variant="h5">CREATE</Typography>
        <Button variant="outlined" onClick={goRandom} endIcon={<NorthEastIcon/>} sx={{mb:"8px"}}>RANDOM</Button>
        <Typography>Fully Customized</Typography>
        <form className="hbox">
          <TextField label="Max Fails" type="number" value={newMaxFails} onChange={(e)=>setNewMaxFails(Number.parseInt(e.target.value))} sx={{width:"5em"}}/>
          <TextField label="Answer" value={newSecret} onChange={(e)=>setNewSecret(e.target.value)}/>
        </form>
        <Box className="hbox" sx={{alignItems: "center"}}>
          {newUrl ?
            <>
              <Button component={Link} to={newUrl} variant="outlined" endIcon={<NorthEastIcon/>} onClick={()=>{window.scrollTo(0,0);gameRef?.current?.focus()}} sx={{textTransform:"none",lineBreak:"anywhere"}}>{newUrl}</Button>
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