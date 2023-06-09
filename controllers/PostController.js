import Post from '../models/Post.js'
import User from '../models/User.js'

export const getAll = async (req, res) => {
	try {
		const { sort, limit, tags } = req.query

		let postsQuery = Post.find().populate({
			path: 'user',
			select: ['fullName', 'avatarUrl'],
		})

		if (sort) {
			postsQuery = postsQuery.sort({ viewsCount: -1 })
			postsQuery = postsQuery.sort({ createdAt: -1 })
		}

		if (limit) {
			postsQuery = postsQuery.limit(parseInt(limit))
		}

		if (tags) {
			const tagsArray = tags.split(',').map(tag => tag.trim())
			postsQuery = postsQuery.where('tags').in(tagsArray)
		}

		const posts = await postsQuery.exec()

		return res.json(posts)
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to get posts',
		})
	}
}

export const getLastTags = async (req, res) => {
	try {
		const posts = await Post.find().limit(5).exec()

		const tagsSet = new Set(posts.map(post => post.tags).flat())

		const tags = Array.from(tagsSet).slice(0, 5)

		res.json(tags)
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to get posts',
		})
	}
}
export const getComments = async (req, res) => {
	try {
		const posts = await Post.find().limit(5).exec()

		const comments = posts
			.map(post => post.comments)
			.flat()
			.sort((a, b) => b.createdAt - a.createdAt)
			.slice(0, 5)

		res.json(comments)
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to get comments',
		})
	}
}

export const create = async (req, res) => {
	try {
		const doc = new Post({
			title: req.body.title,
			text: req.body.text,
			tags: req.body.tags.split(','), // ['tag1', 'tag2']
			imageUrl: req.body.imageUrl,
			user: req.userId,
		})

		const post = await doc.save()

		res.json(post)
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to create post',
		})
	}
}

export const createComment = async (req, res) => {
	try {
		const postId = req.params.id
		const { text } = req.body

		const user = await User.findById(req.userId)

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const comment = {
			text,
			user: {
				id: user._id,
				fullName: user.fullName,
				avatarUrl: user.avatarUrl,
			},
			createdAt: new Date(),
		}

		const post = await Post.findByIdAndUpdate(
			postId,
			{ $push: { comments: comment } },
			{ new: true }
		)

		if (!post) {
			return res.status(404).json({ message: 'Post not found' })
		}

		res.json(post)
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Failed to create comment' })
	}
}

export const getById = async (req, res) => {
	try {
		const postId = req.params.id

		await Post.findOneAndUpdate(
			{ _id: postId },
			{ $inc: { viewsCount: 1 } },
			{ returnDocument: 'after' }
		)
			.populate('user')
			.then(doc => {
				if (!doc) {
					return res.status(404).json({ message: 'Post not found' })
				}

				res.json(doc)
			})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to get post',
		})
	}
}

export const remove = async (req, res) => {
	try {
		const postId = req.params.id
		await Post.findOneAndDelete({ _id: postId }).then(doc => {
			if (!doc) {
				return res.status(404).json({ message: 'Filed to delete post' })
			}

			res.json({
				success: true,
			})
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to delete post',
		})
	}
}

export const removeComment = async (req, res) => {
	try {
		const { postId, commentId } = req.params

		const post = await Post.findOne({ _id: postId })

		if (!post) {
			return res.status(404).json({ message: 'Post not found' })
		}

		const commentIndex = post.comments.findIndex(
			comment => comment._id.toString() === commentId.toString()
		)

		if (commentIndex === -1) {
			return res.status(404).json({ message: 'Comment not found' })
		}

		post.comments.splice(commentIndex, 1)

		await post.save()

		res.status(200).json({ message: 'Comment deleted successfully' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Something went wrong' })
	}
}

export const updateViews = async (req, res) => {
	try {
		const postId = req.params.id

		await Post.updateOne(
			{
				_id: postId,
			},
			{
				title: req.body.title,
				text: req.body.text,
				tags: req.body.tags,
				imageUrl: req.body.imageUrl,
				user: req.userId,
			}
		)
		res.json({
			success: true,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Failed to update post',
		})
	}
}
