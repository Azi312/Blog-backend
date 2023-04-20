import { body } from 'express-validator'

export const loginValidation = [
	body('email').isEmail(),
	body('password').isLength({ min: 5 }),
]
export const registerValidation = [
	body('email').isEmail(),
	body('password').isLength({ min: 5 }),
	body('fullName').isLength({ min: 5 }),
	body('avatarUrl').optional().isURL(),
]
export const postCreateValidation = [
	body('title', 'enter the title of the article').isLength({ min: 3 }),
	body('text', 'enter the text of the article').isLength({ min: 3 }),
	body('tags', 'Wrong tag format').optional().isString(),
	body('imageUrl', 'Wrong image url').optional().isString(),
]
