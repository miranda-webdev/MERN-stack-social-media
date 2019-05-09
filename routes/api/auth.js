const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require("jsonwebtoken");
const config = require('config');

const {
    check,
    validationResult
} = require('express-validator/check');


const User = require('../../models/User');

//@route  GET api/auth
//@desc   Testing route
//@access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

//@route  POST api/auth
//@desc   Auth user & get token
//@access Public
router.post('/', [
    check('email', 'Please provide a valid email')
    .isEmail(),
    check('password', 'Please password is required')
    .exists()
], async (req, res) => {
    const errors = validationResult(req);
    // Sets status to bad request & sends messages
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        email,
        password
    } = req.body;

    try {
        //Testing if user exists
        let user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials'
                }]
            });
        }

        // match email & password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid credentials'
                }]
            });
        }

        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'), {
                expiresIn: 360000
            }, (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


module.exports = router;