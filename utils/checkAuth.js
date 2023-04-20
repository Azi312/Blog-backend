import jwt from 'jsonwebtoken'

export const checkAuth = (req, res, next) => {
	const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')

	if (token) {
		try {
			const decoded = jwt.verify(token, 'secret123')
			req.userId = decoded._id
			next()
		} catch (error) {
			return res.status(401).json({
				message: 'Auth failed',
			})
		}
	}
}
