import React from 'react';
import { useSpeechToText } from '../../../src/hooks/useSpeechToText';
import { PerformanceMode } from '../../../src/types/speechToText';

const VolumeVisualizer: React.FC = () => {
    const {
        isListening,
        audioMetrics,
        toggleListening,
        isSupported,
        silenceDetected,
    } = useSpeechToText({
        language: 'es-ES',
        speechVolumeThreshold: 3,
        speechPauseThreshold: 200,
        performanceMode: PerformanceMode.SPEED,
        onError: (error) => {
            console.error('🚨 Speech-to-text error:', error);
        },
        onSpeechCompleted: (data) => {
            console.log('🤫 Speech completed:', data);
        },
        onVoiceStart: () => {
            console.log('🎤 Voice started');
        },
        onVoiceStop: () => {
            console.log('🎤 Voice stopped');
        },
        audioConfig: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    });
    // useEffect(() => {
    //     console.log('🔊 Audio Metrics Updated:', {
    //         currentVolume: audioMetrics.currentVolume,
    //         currentPitch: audioMetrics.currentPitch,
    //         currentSpectralCentroid: audioMetrics.currentSpectralCentroid,
    //         volumeDataLength: audioMetrics.volumeData.length,
    //         pitchDataLength: audioMetrics.pitchData.length
    //     });
    //     console.log('🎤 isListening:', isListening);

    //     if (isListening && audioMetrics.currentVolume === 0) {
    //         console.warn('⚠️ Audio listening but no volume detected - check microphone permissions');

    //         // Check microphone permissions
    //         navigator.permissions?.query({name: 'microphone'}).then(result => {
    //             console.log('🔒 Microphone permission status:', result.state);
    //         }).catch(e => console.log('Could not check permissions:', e));

    //         // Check available audio devices
    //         navigator.mediaDevices.enumerateDevices().then(devices => {
    //             const audioInputs = devices.filter(device => device.kind === 'audioinput');
    //             console.log('🎙️ Available audio input devices:', audioInputs.length);
    //             audioInputs.forEach((device, i) => {
    //                 console.log(`   ${i + 1}. ${device.label || 'Unknown device'}`);
    //             });
    //         }).catch(e => console.log('Could not enumerate devices:', e));
    //     }
    // }, [audioMetrics, isListening]);
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
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-semibold text-slate-900">Audio Analyzer Dashboard</h1>
                    <p className="text-slate-600 mt-1">Monitor and analyze real-time audio input</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-120px)]">

                    {/* Control Panel */}
                    <div className="lg:col-span-1 flex flex-col">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
                            <h2 className="text-lg font-medium text-slate-900 mb-6">Control Panel</h2>

                            <div className="space-y-6">
                                {/* Main Control Button */}
                                <div className="text-center">
                                    <button
                                        onClick={() => {
                                            console.log('🎤 Toggle listening clicked, current state:', isListening);
                                            toggleListening();
                                        }}
                                        className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${isListening
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {isListening ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                )}
                                            </svg>
                                            <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Status Indicator */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700">Status</span>
                                        <div className={`flex items-center space-x-2 ${isListening ? 'text-green-600' : 'text-slate-400'}`}>
                                            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                            <span className="text-sm font-medium">{isListening ? 'Recording' : 'Stopped'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Threshold Indicator */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Volume Threshold</span>
                                        <span className="text-sm text-slate-500">3%</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${audioMetrics.currentVolume > 3 ? 'text-green-600' : 'text-slate-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${audioMetrics.currentVolume > 3 ? 'bg-green-500' : 'bg-slate-400'
                                            }`}></div>
                                        <span className="text-sm font-medium">
                                            {audioMetrics.currentVolume > 3 ? 'Above threshold' : 'Below threshold'}
                                        </span>
                                    </div>
                                </div>

                                {/* Microphone Status */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Microphone</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${isListening && audioMetrics.currentVolume > 0 ? 'text-green-600' :
                                            isListening && audioMetrics.currentVolume === 0 ? 'text-amber-600' : 'text-slate-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isListening && audioMetrics.currentVolume > 0 ? 'bg-green-500' :
                                                isListening && audioMetrics.currentVolume === 0 ? 'bg-amber-500' : 'bg-slate-400'
                                            }`}></div>
                                        <span className="text-sm font-medium">
                                            {isListening && audioMetrics.currentVolume > 0 ? 'Working' :
                                                isListening && audioMetrics.currentVolume === 0 ? 'Check permissions' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                {/* Silence Detection Status */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Speech Detection</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${isListening && !silenceDetected ? 'text-green-600' :
                                            isListening && silenceDetected ? 'text-blue-600' : 'text-slate-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isListening && !silenceDetected ? 'bg-green-500 animate-pulse' :
                                                isListening && silenceDetected ? 'bg-blue-500' : 'bg-slate-400'
                                            }`}></div>
                                        <span className="text-sm font-medium">
                                            {isListening && !silenceDetected ? 'Speaking' :
                                                isListening && silenceDetected ? 'Silence detected' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Volume Visualization */}
                    <div className="lg:col-span-3 flex items-center">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm w-full">
                            <h2 className="text-lg font-medium text-slate-900 mb-8 text-center">Volume Analysis</h2>

                            <div className="flex justify-center">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl w-full">

                                    {/* Circular Volume Meter */}
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="relative w-56 h-56 mb-6">
                                            {/* Background circle */}
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 224 224">
                                                <circle
                                                    cx="112"
                                                    cy="112"
                                                    r="100"
                                                    stroke="currentColor"
                                                    strokeWidth="12"
                                                    fill="transparent"
                                                    className="text-slate-200"
                                                />
                                                <circle
                                                    cx="112"
                                                    cy="112"
                                                    r="100"
                                                    stroke="currentColor"
                                                    strokeWidth="12"
                                                    fill="transparent"
                                                    className={`transition-all duration-300 ${audioMetrics.currentVolume > 50 ? 'text-red-500' :
                                                        audioMetrics.currentVolume > 25 ? 'text-amber-500' :
                                                            audioMetrics.currentVolume > 10 ? 'text-blue-500' :
                                                                'text-slate-400'
                                                        }`}
                                                    strokeDasharray={`${(audioMetrics.currentVolume / 100) * 628} 628`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                            {/* Center content */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className="text-5xl font-bold text-slate-900 mb-2">
                                                    {Math.round(audioMetrics.currentVolume)}
                                                </div>
                                                <div className="text-sm text-slate-500 font-medium">VOLUME %</div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-sm font-medium text-slate-700 mb-2">Current Level</div>
                                            <div className={`text-sm px-4 py-2 rounded-full font-medium ${audioMetrics.currentVolume > 50 ? 'bg-red-100 text-red-700' :
                                                audioMetrics.currentVolume > 25 ? 'bg-amber-100 text-amber-700' :
                                                    audioMetrics.currentVolume > 10 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {audioMetrics.currentVolume > 50 ? 'HIGH' :
                                                    audioMetrics.currentVolume > 25 ? 'MEDIUM' :
                                                        audioMetrics.currentVolume > 10 ? 'LOW' : 'SILENT'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linear Volume Bars and Metrics */}
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-medium text-slate-700">Volume Level</span>
                                                <span className="text-lg font-semibold text-slate-900">{Math.round(audioMetrics.currentVolume)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-4">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${audioMetrics.currentVolume > 50 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                                        audioMetrics.currentVolume > 25 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                                            audioMetrics.currentVolume > 10 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                                                'bg-gradient-to-r from-slate-300 to-slate-400'
                                                        }`}
                                                    style={{ width: `${Math.min(audioMetrics.currentVolume, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Audio Metrics */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-slate-50 rounded-xl p-6 text-center">
                                                <div className="text-xs text-slate-500 mb-2 font-medium">PITCH</div>
                                                <div className="text-2xl font-bold text-slate-900">
                                                    {audioMetrics.currentPitch > 0 ? `${Math.round(audioMetrics.currentPitch)} Hz` : '--'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-6 text-center">
                                                <div className="text-xs text-slate-500 mb-2 font-medium">DURATION</div>
                                                <div className="text-2xl font-bold text-slate-900">
                                                    {isListening ? '00:00' : '--'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Real-time waveform visualization */}
                                        <div className="bg-slate-50 rounded-xl p-6">
                                            <div className="text-xs text-slate-500 mb-4 font-medium text-center">WAVEFORM</div>
                                            <div className="flex items-end justify-center space-x-2 h-20">
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-3 rounded-full transition-all duration-300 ${isListening && Math.random() * 100 < audioMetrics.currentVolume
                                                            ? 'bg-blue-500'
                                                            : 'bg-slate-300'
                                                            }`}
                                                        style={{
                                                            height: `${isListening ? Math.random() * audioMetrics.currentVolume * 0.7 + 10 : 10}px`
                                                        }}
                                                    ></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VolumeVisualizer;
