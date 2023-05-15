import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
	{
		text: { type: String, required: true },
		user: {
			id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
			fullName: { type: String, required: true },
			avatarUrl: { type: String, required: true },
		},
		createdAt: { type: Date, required: true },
	},
	{ timestamps: true }
)

export default mongoose.model('Comment', commentSchema)
