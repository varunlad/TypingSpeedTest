import React, { useState, useEffect } from "react";
import axios from "axios";
import { difficultList, wordList } from "../Shared/WordSet";
import "./typespeed.scss";

function TypingSpeed() {
  const [sampleText, setSampleText] = useState("Loading...");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(null);
  const [pauseCount, setPauseCount] = useState(0);
  const [level, setLevel] = useState("easy");
  const [copyPasteAlert, setCopyPasteAlert] = useState(false);

  useEffect(() => {
    fetchRandomText();
  }, [level]); // Re-fetch text when level changes

  const getRandomSentence = (wordArr) => {
    const randomWords = wordArr.sort(() => 0.5 - Math.random()).slice(0, 15);
    const sentence = randomWords.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  };

  const fetchRandomText = async () => {
    setSampleText("Loading...");
    try {
      if (level === "easy") {
        setSampleText(getRandomSentence(wordList));
      } else {
        setSampleText(getRandomSentence(difficultList));
      }
      setInput("");
      setStartTime(null);
      setEndTime(null);
      setIsFinished(false);
      setAccuracy(100);
      setBackspaceCount(0);
      setPauseCount(0);
      setCopyPasteAlert(false); // Reset copy-paste alert
    } catch (error) {
      console.error("Error fetching random text:", error);
    }
  };

  useEffect(() => {
    if (input === sampleText) {
      setEndTime(new Date().getTime());
      setIsFinished(true);
      calculateAccuracy();
    }
  }, [input, sampleText]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const currentTime = new Date().getTime();

    if (!startTime) {
      setStartTime(currentTime);
    } else if (lastKeyPressTime && currentTime - lastKeyPressTime > 1000) {
      setPauseCount((prevCount) => prevCount + 1);
    }

    setLastKeyPressTime(currentTime);

    if (e.nativeEvent.inputType === "deleteContentBackward") {
      setBackspaceCount((prevCount) => prevCount + 1);
    }

    if (value.length <= sampleText.length) {
      setInput(value);
    }
  };

  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeTakenInMinutes = (endTime - startTime) / 1000 / 60;
    const wordsTyped = sampleText.split(" ").length;
    return Math.round(wordsTyped / timeTakenInMinutes);
  };

  const calculateAccuracy = () => {
    const smoothnessPenalty = pauseCount * 2;
    const backspacePenalty = backspaceCount;
    const accuracyPercentage = Math.max(
      100 - (smoothnessPenalty + backspacePenalty),
      0
    );
    setAccuracy(accuracyPercentage.toFixed(2));
  };

  const renderTextWithErrors = () => {
    return sampleText.split("").map((char, index) => {
      const isCorrect = input[index] === char;
      return (
        <span
          key={index}
          style={{ color: isCorrect ? "green" : "black", fontWeight: "bold" }}
        >
          {char}
        </span>
      );
    });
  };

  const handleCopyPaste = (e) => {
    e.preventDefault();
    setCopyPasteAlert(true);
    setTimeout(() => setCopyPasteAlert(false), 5000); // Hide alert after 2 seconds
  };

  return (
    <div className="typing_containe">
      <h2 className="typing_animation"> Take Your Typing Speed Test</h2>
      <div className="instructions">
        <h3>Typing Speed Test Instructions</h3>
        <ul>
          <li>
            Choose between Easy or Hard level for different text complexity.
          </li>
          <li>Type the provided text as quickly and accurately as possible.</li>
          <li>Your speed and accuracy will be calculated upon completion.</li>
        </ul>
      </div>
      <div className="level-toggle">
        <button
          className={`toggle-button ${level === "easy" ? "active" : ""}`}
          onClick={() => setLevel("easy")}
        >
          Easy
        </button>
        <button
          className={`toggle-button ${level === "hard" ? "active" : ""}`}
          onClick={() => setLevel("hard")}
        >
          Hard
        </button>
      </div>
      <p style={{ textAlign: "center" }}>{renderTextWithErrors()}</p>
      <textarea
        rows="6"
        cols="50"
        value={input}
        onChange={handleInputChange}
        placeholder="Start typing..."
        disabled={isFinished}
        onPaste={handleCopyPaste}
        onCopy={handleCopyPaste}
      />
      {copyPasteAlert && (
        <p style={{ color: "red", fontSize: 12 }}>
          Copy and paste are disabled to ensure a fair test.
        </p>
      )}
      {isFinished && (
        <div className="result">
          <h3>Results</h3>
          <p>
            Typing Speed :{" "}
            <span className={calculateWPM() > 40 ? "green" : "red"}>
              {calculateWPM()} WPM
            </span>
          </p>
          <p>
            Accuracy :{" "}
            <span className={accuracy > 75 ? "green" : "red"}>
              {accuracy} %
            </span>
          </p>
          <p>Time Taken: {((endTime - startTime) / 1000).toFixed(2)} seconds</p>
          {calculateWPM() > 40 ? <p className="green"> Keyboard warrior in the making! The competition has no chance! Excellent Speed ! </p> : <p className="yellow"> You're getting there! Just remember, slow and steady wins the race! 🐢</p>}
          <button onClick={fetchRandomText}>Try Again</button>
        </div>
      )}
      <div className="info-section">
        <h3> Know how typing speed and accuracy are calculated ?</h3>
        <p>
          <strong>Typing Speed (WPM):</strong> This is the number of words typed
          per minute, calculated by dividing the total number of words by the
          time taken in minutes. Generally, a typing speed of 40-60 WPM is
          considered good for most professions, while data entry and
          transcription roles may require 60+ WPM.
        </p>
        <p>
          <strong>Accuracy:</strong> Accuracy is calculated based on typing
          smoothness (pauses) and errors. Each backspace used and pause over 1
          second reduces the overall accuracy. A 90%+ accuracy rate is ideal for
          professional work, though 80-90% is adequate for most tasks.
        </p>
        <p>
          <strong>Terms Used:</strong>
        </p>
        <ul>
          <li>
            <strong>Backspace Count:</strong> Tracks the number of corrections
            made using backspace, affecting the accuracy.
          </li>
          <li>
            <strong>Pause Count:</strong> Measures the number of times a pause
            longer than 1 second occurs, indicating potential hesitations.
          </li>
          <li>
            <strong>Word Count:</strong> Counts the total words in the sample
            text, used to determine WPM.
          </li>
        </ul>
        <p>
          Improve your speed by practicing frequently and focusing on reducing
          backspaces and pauses for higher accuracy!
        </p>
      </div>
    </div>
  );
}

export default TypingSpeed;
