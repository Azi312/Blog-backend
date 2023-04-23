import express from 'express'
import mongoose from 'mongoose'
import cloudinary from './utils/cloudinary.js'
import multer from 'multer'
import cors from 'cors'

import {
	registerValidation,
	loginValidation,
	postCreateValidation,
} from './validation.js'
import { UserController, PostController } from './controllers/index.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('Connected to MongoDB')
	})
	.catch(err => {
		console.log('Error MongoDB', err)
	})

const app = express()
const port = 4444

const upload = multer({ dest: 'uploads/' })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post(
	'/auth/login',
	loginValidation,
	handleValidationErrors,
	UserController.login
)
app.post(
	'/auth/register',
	registerValidation,
	handleValidationErrors,
	UserController.register
)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', upload.single('image'), async (req, res) => {
	try {
		const result = await cloudinary.uploader.upload(req.file.path)
		res.json({ url: result.secure_url })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Failed to upload image' })
	}
})

app.get('/tags', PostController.getLastTags)
app.get('/comments', PostController.getComments)

app.get('/posts', PostController.getAll)
app.get('/tags/posts', PostController.getLastTags)
app.get('/comments/posts', PostController.getComments)
app.get('/posts/:id', PostController.getById)

app.post('/posts', checkAuth, postCreateValidation, PostController.create)
app.post('/posts/:id/comments', checkAuth, PostController.createComment)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, PostController.updateViews)

app.listen(process.env.PORT || 4444, err => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`App listening on port ${port}`)
})
