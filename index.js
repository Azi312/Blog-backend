import express from 'express'
import mongoose from 'mongoose'
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
	.connect(
		'mongodb+srv://Aziz:www@aziz.bbmzox1.mongodb.net/blog?retryWrites=true&w=majority'
	)
	.then(() => {
		console.log('Connected to MongoDB')
	})
	.catch(err => {
		console.log('Error MongoDB', err)
	})

const app = express()
const port = 4444

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads')
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname)
	},
})

const upload = multer({ storage })

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

app.post('/upload', upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/${req.file.originalname}`,
	})
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
// app.put('/posts/:id', PostController.update)

app.listen(4444, err => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`Example app listening on port ${port}`)
})
