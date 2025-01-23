/**
 * Генерация уникального id в формате xxxx-xxxxxxxxx-xx.
 * Идентификатор состоит из букв (в верхнем и нижнем регистрах) и цифр.
 * @returns Уникальный идентификатор
 */

export const generateId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Генерация каждой части идентификатора
    const part1 = generateRandomString(chars, 4);
    const part2 = generateRandomString(chars, 9);
    const part3 = generateRandomString(chars, 2);

    // Сборка идентификатора
    return `${part1}-${part2}-${part3}`;
}

/**
 * Генерация случайной строки заданной длины из указанных символов.
 * @param chars - Символы, из которых будет генерироваться строка.
 * @param length - Длина строки.
 * @returns Случайная строка.
 */
const generateRandomString = (chars: string, length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        // Выборка случайного символа из строки chars
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    return result;
}