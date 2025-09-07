import React from "react";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw } from "lucide-react";
import useVoice from "../hooks/useVoice";

const VoiceControls = ({
  onTranscriptChange,
  onSpeak,
  textToSpeak,
  disabled = false,
}) => {
  const {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError,
  } = useVoice();

  React.useEffect(() => {
    if (transcript && onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  React.useEffect(() => {
    if (textToSpeak && onSpeak) {
      onSpeak(textToSpeak);
    }
  }, [textToSpeak, onSpeak]);

  const handleSpeak = () => {
    if (textToSpeak) {
      speak(textToSpeak);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
  };

  const handleClearTranscript = () => {
    clearTranscript();
    if (onTranscriptChange) {
      onTranscriptChange("");
    }
  };

  return (
    <div
      className="voice-controls"
      style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "20px",
        border: "1px solid #e1e5e9",
      }}
    >
      <h4 style={{ marginBottom: "15px", color: "#333" }}>Voice Controls</h4>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "15px" }}>
          {error}
          <button
            onClick={clearError}
            style={{
              float: "right",
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`btn ${isListening ? "btn-danger" : "btn-success"}`}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>

        {textToSpeak && (
          <button
            onClick={isSpeaking ? handleStopSpeaking : handleSpeak}
            disabled={disabled}
            className={`btn ${isSpeaking ? "btn-danger" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {isSpeaking ? "Stop Speaking" : "Speak Question"}
          </button>
        )}

        {transcript && (
          <button
            onClick={handleClearTranscript}
            disabled={disabled}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RotateCcw size={20} />
            Clear Transcript
          </button>
        )}
      </div>

      {transcript && (
        <div style={{ marginTop: "15px" }}>
          <label className="form-label">Voice Transcript:</label>
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #e1e5e9",
              minHeight: "80px",
              whiteSpace: "pre-wrap",
            }}
          >
            {transcript}
          </div>
        </div>
      )}

      <div
        style={{
          fontSize: "14px",
          color: "#666",
          marginTop: "10px",
          fontStyle: "italic",
        }}
      >
        {isListening && "Listening... Speak your answer clearly."}
        {isSpeaking && "Speaking the question..."}
        {!isListening &&
          !isSpeaking &&
          'Click "Start Listening" to use voice input, or "Speak Question" to hear the question.'}
      </div>
    </div>
  );
};

export default VoiceControls;
