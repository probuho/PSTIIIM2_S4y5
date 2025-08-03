import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/components/context/auth-context";
import { toast } from "sonner";
import quizData from "./quiz-list.json";
import { QuizGenerator, type QuizEntry, type QuizData } from "@/components/utils/QuizGenerator";

//Dificultades
const difficultyOptions = [
    { value: "easy", label: "Fácil", questionCount: 5, timeLimit: 20, pointsPerQuestion: 10 },
    { value: "medium", label: "Normal", questionCount: 10, timeLimit: 15, pointsPerQuestion: 15 },
    { value: "hard", label: "Difícil", questionCount: 15, timeLimit: 10, pointsPerQuestion: 20 },
];

//Puntuacion
type Score = {
    date: string;
    score: number;
    difficulty: string;
    user: string;
    totalRemainingTime?: number;
};

//Función para la fecha a utilizar en el historial
function getNowDate() {
    return new Date().toISOString().slice(0, 10);
}

export default function QuizPage() {
    const { session } = useSession();
    const [difficulty, setDifficulty] = useState("easy");
    const [quizQuestions, setQuizQuestions] = useState<QuizData>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [totalRemainingTime, setTotalRemainingTime] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [showEnd, setShowEnd] = useState(false);
    const [scores, setScores] = useState<Score[]>([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    //Configuración de la puntuación
    useEffect(() => {
        const key = "quiz-scores";
        const raw = window.localStorage.getItem(key);
        if (raw) {
            setScores(JSON.parse(raw));
        }
    }, []);
    const saveScores = useCallback((newScores: Score[]) => {
        setScores(newScores);
        window.localStorage.setItem("quiz-scores", JSON.stringify(newScores));
    }, []);

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
            setRemainingTime(currentDifficultyOption?.timeLimit || 20); //Reinicio de temporizador entre preguntas
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            //Logica del game over
            setIsGameActive(false);
            const user = session?.user?.nickname || "Anónimo";
            const pointsPerQuestion = currentDifficultyOption?.pointsPerQuestion || 10;
            const finalScore = totalRemainingTime * pointsPerQuestion;
            setFinalScore(finalScore);

            const newScore: Score = {
                date: getNowDate(),
                score: finalScore,
                difficulty: currentDifficultyOption?.label || difficulty,
                user,
                totalRemainingTime,
            };
            const newScores = [newScore, ...scores];
            saveScores(newScores);
            setShowEnd(true);
            toast.success("¡Quiz completado!");
        }
    }, [currentQuestionIndex, quizQuestions.length, currentDifficultyOption, isAnswered, session, totalRemainingTime, difficulty, scores, saveScores]);


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

        const currentQuestion = quizQuestions[currentQuestionIndex];
        const isCorrect = currentQuestion.answer === selected;

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

    const displayedScores = useMemo(() => scores.slice(0, 3), [scores]);
    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <div className="flex flex-col md:flex-row gap-10 w-full h-[calc(100vh-64px)] p-6 max-w-[1600px] mx-auto">
            {/* Panel izquierdo */}
            <div className="w-full md:w-[340px] bg-white/90 rounded-2xl shadow-lg p-6 flex flex-col gap-6 mb-4 md:mb-0">
                <Label className="text-lg mb-2">Dificultad</Label>
                <ToggleGroup
                    type="single"
                    value={difficulty}
                    onValueChange={handleDifficultyChange}
                    className="w-full gap-4 mb-2"
                >
                    {difficultyOptions.map((opt) => (
                        <ToggleGroupItem
                            key={opt.value}
                            value={opt.value}
                            variant={difficulty === opt.value ? "outline" : "default"}
                            size="lg"
                            className="flex-1 py-4 px-0 rounded-xl text-base shadow-sm border-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
                        >
                            {opt.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                {/* Puntuación actual */}
                <div>
                    <Label className="text-md">Puntuación Actual</Label>
                    <div className="flex flex-col mt-2 text-sm gap-2">
                        <span>Preguntas Correctas: <span className="font-bold text-blue-700">{correctAnswers}</span></span>
                        <span>Preguntas Restantes: <span className="font-bold text-blue-700">{quizQuestions.length - currentQuestionIndex}</span></span>
                        <span>Tiempo Restante: <span className="font-bold text-blue-700">{remainingTime}s</span></span>
                    </div>
                </div>

                {/* Historial de puntuaciones */}
                <div className="flex-grow overflow-y-auto">
                    <Label className="text-md mb-2">Historial de Puntuaciones</Label>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Puntos</TableHead>
                                <TableHead>Dificultad</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedScores.map((score, i) => (
                                <TableRow key={i}>
                                    <TableCell>{score.date}</TableCell>
                                    <TableCell>{score.user}</TableCell>
                                    <TableCell>{score.score}</TableCell>
                                    <TableCell>{score.difficulty}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Tablero del quiz (lado derecho) */}
            <div className="flex-1 flex flex-col w-full h-full overflow-y-auto">
                {/* Título y boton de reinicio de juego */}
                <div className="flex items-center justify-between w-full max-w-5xl mb-4 self-center md:self-auto px-6 md:px-0">
                    <Label className="text-2xl">Desafío eco explorador</Label>
                    <Button onClick={startNewGame}>Reiniciar Juego</Button>
                </div>

                {/* Quiz */}
                <div className="bg-white/90 rounded-2xl shadow-lg p-6 w-full mx-auto flex justify-center items-center flex-grow flex-shrink-0 mb-6">
                    {isGameActive && currentQuestion ? (
                        <div className="w-full flex flex-col gap-6">
                            <div className="text-xl font-semibold text-center mb-4">
                                {currentQuestion.question}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.sort().map((option, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered || remainingTime <= 0}
                                        className={`w-full py-4 px-6 rounded-xl text-lg font-bold shadow-sm transition-colors duration-300
                                            ${isAnswered && (option === currentQuestion.answer) ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                                            ${isAnswered && (option !== currentQuestion.answer) && (option === selectedOption) ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                                            ${isAnswered && (option !== currentQuestion.answer) && (option !== selectedOption) ? 'bg-gray-200 text-gray-700' : ''}
                                            ${!isAnswered ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : ''}
                                        `}
                                    >
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-lg text-gray-500">
                            {quizQuestions.length > 0 ? "Comienza un nuevo juego seleccionando la dificultad." : "Cargando preguntas..."}
                        </p>
                    )}
                </div>

                {/* Ventana de juego finalizado */}
                {showEnd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 items-center animate-in fade-in max-h-[90vh] overflow-y-auto">
                            <h2 className="text-3xl font-bold text-center">¡Quiz Completado!</h2>
                            <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col items-center">
                                <span className="font-semibold text-lg mb-2">Puntuación Final</span>
                                <div className="flex justify-center gap-12 text-xl text-center">
                                    <div>
                                        Respuestas Correctas:<br />
                                        <span className="font-bold text-blue-700 text-3xl">{correctAnswers}/{quizQuestions.length}</span>
                                    </div>
                                    <div>
                                        Tiempo Total Restante:<br />
                                        <span className="font-bold text-blue-700 text-3xl">{totalRemainingTime}s</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    Puntuación Total:<br />
                                    <span className="font-bold text-blue-700 text-4xl">{finalScore}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-50 rounded-xl p-4">
                                <span className="font-semibold text-lg block mb-2">Historial de Puntuaciones</span>
                                <div className="flex flex-col gap-2">
                                    {displayedScores.map((score, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm shadow border">
                                            <span className="text-xs text-muted-foreground w-24">{score.date}</span>
                                            <span className="flex-1">Puntos: <b>{score.score}</b>, Dificultad: <b>{score.difficulty}</b></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Seleccion de dificultad para nuevo juego */}
                            <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3 items-center">
                                <span className="font-semibold text-lg">Selecciona Dificultad para jugar de nuevo</span>
                                <ToggleGroup
                                    type="single"
                                    value={difficulty}
                                    onValueChange={handleDifficultyChange}
                                    className="w-full gap-4"
                                >
                                    {difficultyOptions.map((opt) => (
                                        <ToggleGroupItem
                                            key={opt.value}
                                            value={opt.value}
                                            variant={difficulty === opt.value ? "outline" : "default"}
                                            size="lg"
                                            className="flex-1 py-3 px-0 rounded-xl text-base shadow-sm border-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50"
                                        >
                                            {opt.label}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </div>
                            <Button
                                className="w-full mt-2 text-lg py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                onClick={() => {
                                    setShowEnd(false);
                                    startNewGame();
                                }}
                            >
                                Nueva partida
                            </Button>
                            <Button
                                className="w-full text-lg py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
                                onClick={() => setShowEnd(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
