import { hash, compare } from "bcrypt";


export const generateHash = async (
    plainText: string,
    saltRounds: number = Number(process.env.SALT_ROUNDS)
): Promise<string> => {
    return await hash(plainText, saltRounds);
}

export const compareHash = async (

    plainText: string,
    hash: string
): Promise<Boolean> => {
    return await compare(plainText, hash);
}   
