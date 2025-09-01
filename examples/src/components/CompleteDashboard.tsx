import React, { useState } from 'react';
import { useSpeechToText } from '../../../src/hooks/useSpeechToText';
import { PerformanceMode } from '../../../src/types/speechToText';

const CompleteDashboard: React.FC = () => {
    // Configuration
    const SILENCE_TIMEOUT = 2000; // 2 seconds
    const VOLUME_THRESHOLD = 8; // Higher threshold for less sensitivity
    
    const [showRawData, setShowRawData] = useState(false);
    
    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        silenceDetected,
        silenceCountdown,
        sessionMetadata,
        audioMetrics,
        chartData,
        startListening,
        stopListening,
        clearTranscript,
        copyMetadataToClipboard
    } = useSpeechToText({
        language: 'es-ES',
        silenceTimeout: SILENCE_TIMEOUT,
        optimizedMode: true,
        performanceMode: PerformanceMode.BALANCED,
        onError: (error) => {
            console.error('🚨 Speech-to-text error:', error);
        },
        onSpeechCompleted: (data) => {
            console.log('🤫 Speech completed:', data);
        },
        audioConfig: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    });

    const formatTime = (ms: number): string => {
        return (ms / 1000).toFixed(1) + 's';
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString();
    };

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-xl text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Navegador no compatible</h2>
                    <p className="text-slate-600 mb-2">Tu navegador no soporta reconocimiento de voz</p>
                    <p className="text-sm text-slate-500">Prueba con Chrome, Edge o Safari</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Speech-to-Text Complete Dashboard</h1>
                        <p className="text-slate-600 mt-1">Comprehensive analysis of all hook properties</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowRawData(!showRawData)}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            {showRawData ? 'Hide' : 'Show'} Raw Data
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Control Panel */}
                    <div className="space-y-6">
                        
                        {/* Main Controls */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Controls</h2>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={startListening}
                                    disabled={isListening}
                                    className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
                                        isListening
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    🎤 Start Listening
                                </button>
                                
                                <button
                                    onClick={stopListening}
                                    disabled={!isListening}
                                    className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
                                        !isListening
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                >
                                    🛑 Stop Listening
                                </button>
                                
                                <button
                                    onClick={clearTranscript}
                                    className="w-full py-3 px-4 rounded-xl font-medium bg-slate-500 text-white hover:bg-slate-600 transition-colors"
                                >
                                    🧹 Clear Transcript
                                </button>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Status</h2>
                            
                            <div className="space-y-4">
                                {/* Listening Status */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Listening</span>
                                    <div className={`flex items-center space-x-2 ${isListening ? 'text-green-600' : 'text-slate-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                        <span className="font-medium">{isListening ? 'Active' : 'Inactive'}</span>
                                    </div>
                                </div>

                                {/* Silence Detection */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Silence Detected</span>
                                    <div className={`flex items-center space-x-2 ${silenceDetected ? 'text-blue-600' : 'text-slate-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${silenceDetected ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                                        <span className="font-medium">{silenceDetected ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>

                                {/* Volume Level */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Volume Level</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-slate-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-150 ${
                                                    audioMetrics.currentVolume > VOLUME_THRESHOLD ? 'bg-green-500' : 'bg-slate-400'
                                                }`}
                                                style={{ width: `${Math.min(100, audioMetrics.currentVolume)}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-mono text-sm">{audioMetrics.currentVolume.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Silence Countdown */}
                        {isListening && silenceCountdown > 0 && (
                            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
                                <h2 className="text-lg font-medium text-amber-800 mb-4">Silence Timer</h2>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-amber-700">Time Remaining</span>
                                        <span className="text-xl font-mono text-amber-800">{formatTime(silenceCountdown)}</span>
                                    </div>
                                    
                                    <div className="w-full bg-amber-200 rounded-full h-3">
                                        <div 
                                            className="bg-amber-500 h-3 rounded-full transition-all duration-75 ease-linear"
                                            style={{ width: `${Math.max(0, (silenceCountdown / SILENCE_TIMEOUT) * 100)}%` }}
                                        ></div>
                                    </div>
                                    
                                    <p className="text-xs text-amber-700">
                                        Recording will stop in {Math.ceil(silenceCountdown / 1000)} seconds
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transcript and Audio Analysis */}
                    <div className="space-y-6">
                        
                        {/* Transcript */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-slate-900">Transcript</h2>
                                <span className="text-sm text-slate-500">{transcript.length} characters</span>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Final Transcript */}
                                <div className="min-h-[120px] p-4 bg-slate-50 rounded-lg border">
                                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Final Text</label>
                                    <p className="mt-2 text-slate-900 leading-relaxed">
                                        {transcript || <span className="text-slate-400 italic">No transcript yet...</span>}
                                    </p>
                                </div>

                                {/* Interim Transcript */}
                                {interimTranscript && (
                                    <div className="min-h-[60px] p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Live (Interim)</label>
                                        <p className="mt-2 text-blue-900 leading-relaxed italic">
                                            {interimTranscript}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Real-time Audio Metrics */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Real-time Audio Analysis</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Volume */}
                                <div className="text-center p-4 bg-slate-50 rounded-xl">
                                    <div className="text-2xl font-bold text-slate-900">{audioMetrics.currentVolume.toFixed(1)}</div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Volume</div>
                                    <div className="text-xs text-slate-500">0-100 scale</div>
                                </div>

                                {/* Pitch */}
                                <div className="text-center p-4 bg-slate-50 rounded-xl">
                                    <div className="text-2xl font-bold text-slate-900">
                                        {audioMetrics.currentPitch > 0 ? audioMetrics.currentPitch.toFixed(0) : '—'}
                                    </div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Pitch</div>
                                    <div className="text-xs text-slate-500">Hz</div>
                                </div>

                                {/* Spectral Centroid */}
                                <div className="text-center p-4 bg-slate-50 rounded-xl">
                                    <div className="text-2xl font-bold text-slate-900">
                                        {audioMetrics.currentSpectralCentroid > 0 ? audioMetrics.currentSpectralCentroid.toFixed(0) : '—'}
                                    </div>
                                    <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Spectral</div>
                                    <div className="text-xs text-slate-500">Hz</div>
                                </div>
                            </div>

                            {/* Data Points Count */}
                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-slate-700">{audioMetrics.volumeData.length}</div>
                                    <div className="text-xs text-slate-500">Volume points</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-slate-700">{audioMetrics.pitchData.length}</div>
                                    <div className="text-xs text-slate-500">Pitch points</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-slate-700">{audioMetrics.spectralCentroidData.length}</div>
                                    <div className="text-xs text-slate-500">Spectral points</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Session Metadata & Advanced */}
                    <div className="space-y-6">
                        
                        {/* Session Metadata */}
                        {sessionMetadata && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-slate-900">Session Metadata</h2>
                                    <button
                                        onClick={copyMetadataToClipboard}
                                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        📋 Copy JSON
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-600">Words:</span>
                                            <span className="ml-2 text-slate-900">{sessionMetadata.words.length}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">Duration:</span>
                                            <span className="ml-2 text-slate-900">{formatTime(sessionMetadata.totalDuration)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">WPM:</span>
                                            <span className="ml-2 text-slate-900">
                                                {sessionMetadata.totalDuration > 0 
                                                    ? ((sessionMetadata.words.length / (sessionMetadata.totalDuration / 1000)) * 60).toFixed(1)
                                                    : '0.0'
                                                }
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-600">Started:</span>
                                            <span className="ml-2 text-slate-900">{formatDate(sessionMetadata.sessionStartTime)}</span>
                                        </div>
                                    </div>

                                    {/* Audio Statistics */}
                                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                        <h4 className="font-medium text-slate-700 mb-2">Audio Statistics</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>Avg Volume: {sessionMetadata.overallAverageVolume.toFixed(1)}</div>
                                            <div>Peak Volume: {sessionMetadata.overallPeakVolume.toFixed(1)}</div>
                                            <div>Avg Pitch: {sessionMetadata.overallAveragePitch.toFixed(0)} Hz</div>
                                            <div>Peak Pitch: {sessionMetadata.overallPeakPitch.toFixed(0)} Hz</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chart Data Summary */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Chart Data</h2>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Volume Data</span>
                                    <span className="text-slate-600">{chartData.volumeData.length} points</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Pitch Data</span>
                                    <span className="text-slate-600">{chartData.pitchData.length} points</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Speech Rate</span>
                                    <span className="text-slate-600">{chartData.speechRateData.length} points</span>
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Configuration</h2>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Language:</span>
                                    <span className="font-mono">es-ES</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Silence Timeout:</span>
                                    <span className="font-mono">{SILENCE_TIMEOUT}ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Volume Threshold:</span>
                                    <span className="font-mono">{VOLUME_THRESHOLD}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Performance Mode:</span>
                                    <span className="font-mono">BALANCED</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Optimized Mode:</span>
                                    <span className="font-mono">true</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Raw Data Section */}
                {showRawData && (
                    <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Raw Hook Data</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-slate-700 mb-2">Audio Metrics</h3>
                                <pre className="text-xs bg-slate-50 p-4 rounded-lg overflow-auto max-h-64">
                                    {JSON.stringify(audioMetrics, null, 2)}
                                </pre>
                            </div>
                            
                            {sessionMetadata && (
                                <div>
                                    <h3 className="font-medium text-slate-700 mb-2">Session Metadata</h3>
                                    <pre className="text-xs bg-slate-50 p-4 rounded-lg overflow-auto max-h-64">
                                        {JSON.stringify(sessionMetadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompleteDashboard;
