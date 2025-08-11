import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import { useHybridScores } from "@/hooks/useHybridScores";
import { useUnsplashImage } from "@/hooks/useUnsplashImage";
import quizData from "./quiz-list.json";
import { QuizGenerator, type QuizEntry, type QuizData } from "@/components/utils/QuizGenerator";

//Dificultades
const difficultyOptions = [
    { value: "easy", label: "Fácil", questionCount: 5, timeLimit: 20, pointsPerQuestion: 10, multiplier: 1.0 },
    { value: "medium", label: "Normal", questionCount: 10, timeLimit: 15, pointsPerQuestion: 15, multiplier: 1.2 },
    { value: "hard", label: "Difícil", questionCount: 15, timeLimit: 10, pointsPerQuestion: 20, multiplier: 1.5 },
];

export default function QuizPage() {
    const { session } = useSession();
    const { scores: topScores, loading: loadingScores, error: scoresError, saveScore, refreshScores } = useHybridScores("Quiz", 5);
    
    const [difficulty, setDifficulty] = useState("easy");
    const [quizQuestions, setQuizQuestions] = useState<QuizData>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [totalRemainingTime, setTotalRemainingTime] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [showEnd, setShowEnd] = useState(false);
    const [isGameActive, setIsGameActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Hook para imagen de Unsplash
    const imageQuery = quizQuestions[currentQuestionIndex]?.answer || "animal";
    const { image: questionImage, loading: imageLoading } = useUnsplashImage(imageQuery);

    //Guardado en memoria de la dificultad actual
    const currentDifficultyOption = useMemo(() => {
        return difficultyOptions.find((opt) => opt.value === difficulty);
    }, [difficulty]);

    //Temporizador para preguntas
    useEffect(() => {
        if (!isGameActive || isAnswered || remainingTime <= 0) return;

        const timer = setTimeout(() => {
            setRemainingTime(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isGameActive, isAnswered, remainingTime]);

    //Logica del temporizador entre preguntas y juegos
    useEffect(() => {
        if (isGameActive && remainingTime === 0 && !isAnswered) {
            handleMoveToNextQuestion();
        }
    }, [remainingTime, isGameActive, isAnswered]);

    const handleMoveToNextQuestion = useCallback(() => {
        const newIndex = currentQuestionIndex + 1;
        if (newIndex < quizQuestions.length) {
            setCurrentQuestionIndex(newIndex);
            setRemainingTime(currentDifficultyOption?.timeLimit || 20);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            //Logica del game over
            setIsGameActive(false);
            const userName = session?.user?.nickname || session?.user?.name || "Usuario Invitado";
            const userId = session?.user?.id;
            const pointsPerQuestion = currentDifficultyOption?.pointsPerQuestion || 10;
            const finalScore = totalRemainingTime * pointsPerQuestion;
            setFinalScore(finalScore);

            // Guardar puntuación usando el hook híbrido
            saveScore({
                userId,
                userName,
                game: "Quiz",
                score: finalScore,
                movimientos: correctAnswers,
                tiempo: totalRemainingTime,
                dificultad: difficulty
            });

            setShowEnd(true);
            toast.success("¡Quiz completado!");
        }
    }, [currentQuestionIndex, quizQuestions.length, currentDifficultyOption, isAnswered, session, totalRemainingTime, difficulty, correctAnswers, saveScore]);

    //Logica de nueva partida
    const startNewGame = useCallback(() => {
        const currentDifficulty = difficultyOptions.find((opt) => opt.value === difficulty);
        if (!currentDifficulty) {
            return;
        }

        const selectedQuestions = QuizGenerator(quizData as QuizEntry[], currentDifficulty.questionCount);
        setQuizQuestions(selectedQuestions);
        setCurrentQuestionIndex(0);
        setCorrectAnswers(0);
        setTotalRemainingTime(0);
        setRemainingTime(currentDifficulty.timeLimit);
        setShowEnd(false);
        setIsGameActive(true);
        setSelectedOption(null);
        setIsAnswered(false);

        if (selectedQuestions.length === 0) {
            toast.error("No se pudieron generar preguntas para el quiz. Intente de nuevo.");
            setIsGameActive(false);
        }
    }, [difficulty]);

    //Nueva partida al cambiar dificultad
    useEffect(() => {
        startNewGame();
    }, [difficulty, startNewGame]);

    //Logica de las respuestas
    const handleAnswer = useCallback((selected: string) => {
        if (!isGameActive || isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(selected);

        const question = quizQuestions[currentQuestionIndex];
        const isCorrect = question.answer === selected;

        if (isCorrect) {
            setCorrectAnswers(prev => prev + 1);
            setTotalRemainingTime(prev => prev + remainingTime);
        }

        setTimeout(() => {
            handleMoveToNextQuestion();
        }, 1000);
    }, [isGameActive, isAnswered, quizQuestions, currentQuestionIndex, remainingTime, handleMoveToNextQuestion]);

    const handleDifficultyChange = (v: string) => {
        if (v) {
            setDifficulty(v);
            setShowEnd(false);
        }
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Título y descripción */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                    🦁 Quiz del Reino Animal
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Pon a prueba tu conocimiento sobre el reino animal con estas preguntas educativas. 
                    ¡Responde correctamente y acumula puntos!
                </p>
            </div>

            {/* Panel de control mejorado */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 shadow-lg">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Configuración de dificultad */}
                    <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
                        <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            🎯 Dificultad
                        </Label>
                        <ToggleGroup
                            type="single"
                            value={difficulty}
                            onValueChange={handleDifficultyChange}
                            className="justify-start"
                        >
                            {difficultyOptions.map((opt) => (
                                <ToggleGroupItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="px-4 py-2 data-[state=on]:bg-green-600 data-[state=on]:text-white"
                                >
                                    {opt.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        
                        <Button 
                            onClick={startNewGame} 
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-md"
                        >
                            🎮 Nuevo Juego
                        </Button>
                    </div>

                    {/* Estadísticas del juego */}
                    <div className="xl:col-span-2 space-y-4">
                        <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            📊 Estadísticas del Juego
                        </Label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-green-500">✅</span>
                                    <p className="text-sm text-gray-600 font-medium">Respuestas Correctas</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-500">⏱️</span>
                                    <p className="text-sm text-gray-600 font-medium">Tiempo Restante</p>
                                </div>
                                <ProgressBar 
                                    current={remainingTime} 
                                    max={currentDifficultyOption?.timeLimit || 20}
                                    showLabel={false}
                                    className="mt-2"
                                />
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-purple-500">🎯</span>
                                    <p className="text-sm text-gray-600 font-medium">Progreso</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">
                                    {quizQuestions.length > 0 ? Math.round((currentQuestionIndex / quizQuestions.length) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tablero del Quiz */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 w-full max-w-6xl">
                                                 {isGameActive && currentQuestion ? (
                             <div className="w-full flex flex-col gap-6">
                                 {/* Carta visual con imagen */}
                                <div className="flex flex-col lg:flex-row gap-6 items-center">
                                    {/* Imagen de la pregunta */}
                                    <div className="w-full lg:w-1/2">
                                        <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                                            {imageLoading ? (
                                                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                                </div>
                                            ) : questionImage ? (
                                                <div className="relative">
                                                    <img 
                                                        src={questionImage.urls.regular} 
                                                        alt={questionImage.alt_description}
                                                        className="w-full h-64 object-cover"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                        <p className="text-white text-sm font-medium">
                                                            📸 {questionImage.user.name} en Unsplash
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                    <div className="text-4xl">🦁</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pregunta y opciones */}
                                    <div className="w-full lg:w-1/2 space-y-6">
                                        <div className="text-2xl font-semibold text-center text-gray-800">
                                            {currentQuestion.question}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentQuestion.options.sort().map((option, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() => handleAnswer(option)}
                                                    disabled={isAnswered || remainingTime <= 0}
                                                    className={`w-full py-6 px-6 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 ${
                                                        isAnswered && (option === currentQuestion.answer) ? 'bg-green-500 hover:bg-green-600 text-white scale-105 border-2 border-green-600' : ''
                                                    } ${
                                                        isAnswered && (option !== currentQuestion.answer) && (option === selectedOption) ? 'bg-red-500 hover:bg-red-600 text-white scale-105 border-2 border-red-600' : ''
                                                    } ${
                                                        isAnswered && (option !== currentQuestion.answer) && (option !== selectedOption) ? 'bg-gray-200 text-gray-700 border-2 border-gray-300' : ''
                                                    } ${
                                                        !isAnswered ? 'bg-white hover:bg-blue-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 hover:scale-105' : ''
                                                    }`}
                                                >
                                                    {option}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-8">
                                <div className="text-6xl">🦁</div>
                                <p className="text-lg text-gray-500">
                                    {quizQuestions.length > 0 ? "Comienza un nuevo juego seleccionando la dificultad." : "Cargando preguntas..."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top puntuaciones mejorado */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                        🏆 Top 5 Puntuaciones
                        <span className="text-sm font-normal text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                            ¡Compite por el primer lugar!
                        </span>
                    </h2>
                    <Button 
                        onClick={refreshScores} 
                        variant="outline" 
                        size="sm"
                        disabled={loadingScores}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                        {loadingScores ? "🔄 Actualizando..." : "🔄 Actualizar"}
                    </Button>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-inner">
                    {loadingScores ? (
                        <div className="text-center text-gray-500 py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                            Cargando puntuaciones...
                        </div>
                    ) : scoresError ? (
                        <div className="text-center text-red-500 py-8">
                            <span className="text-2xl">❌</span>
                            <p className="mt-2">{scoresError}</p>
                        </div>
                    ) : topScores.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <span className="text-4xl">🎯</span>
                            <p className="mt-2 text-lg">No hay puntuaciones aún</p>
                            <p className="text-sm">¡Sé el primero en establecer un récord!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topScores.map((score, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                                    i === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 shadow-lg' :
                                    i === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300' :
                                    i === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300' :
                                    'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                                            i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                                            i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                                            'bg-gradient-to-br from-blue-400 to-blue-600'
                                        }`}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-900 text-lg">{score.userName}</span>
                                            {score.isAuthenticated ? (
                                                <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium border border-green-200">
                                                    ✅ Verificado
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                                                    👤 Invitado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold text-2xl ${
                                            i === 0 ? 'text-yellow-700' : 
                                            i === 1 ? 'text-gray-700' : 
                                            i === 2 ? 'text-orange-700' : 
                                            'text-blue-700'
                                        }`}>
                                            {score.score.toLocaleString()}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(score.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de fin de juego mejorado */}
            <Dialog open={showEnd} onOpenChange={setShowEnd}>
                <DialogContent className="sm:max-w-lg">
                    <div className="text-center space-y-6">
                        <div className="space-y-3">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                ¡Quiz Completado!
                            </h2>
                            <p className="text-gray-600 text-lg">¡Excelente trabajo! Has demostrado tu conocimiento del reino animal.</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 space-y-4 border border-green-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-3 text-center border border-green-200">
                                    <div className="text-green-500 text-sm font-medium mb-1">Respuestas Correctas</div>
                                    <div className="text-2xl font-bold text-green-600">{correctAnswers}/{quizQuestions.length}</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                                    <div className="text-blue-500 text-sm font-medium mb-1">Puntuación Total</div>
                                    <div className="text-2xl font-bold text-blue-600">{finalScore}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                                <div className="text-purple-500 text-sm font-medium mb-1">Dificultad</div>
                                <div className="text-xl font-bold text-purple-600 capitalize">{difficulty}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => setShowEnd(false)} 
                                variant="outline" 
                                className="flex-1 border-gray-300 hover:bg-gray-50"
                            >
                                👀 Continuar
                            </Button>
                            <Button 
                                onClick={() => {
                                    setShowEnd(false);
                                    startNewGame();
                                }} 
                                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-md"
                            >
                                🎮 Jugar de nuevo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
