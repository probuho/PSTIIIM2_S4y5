//Tipos del quiz
export type QuizEntry = {
    question: string;
    answer: string;
    options: string[];
};

//Tipo de la data del quiz
export type QuizData = QuizEntry[];

/**
 * Generación de quiz en base a número de preguntas.
 * @param allQuestions
 * @param count
 * @returns
 */
export function QuizGenerator(allQuestions: QuizEntry[], count: number): QuizData {
    // Duplicación del array para evitar modificar los datos originales
    const shuffledQuestions = [...allQuestions].sort(() => 0.5 - Math.random());
    
    //Selección del número de palabras
    return shuffledQuestions.slice(0, count);
}