const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const config = require('config');

const {
    check,
    validationResult
} = require('express-validator/check')

const User = require('../../models/User');


//@route  POST api/users
//@desc   Testing route
//@access Public
router.post('/', [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please provide a valid email')
    .isEmail(),
    check('password', 'Please enter a password with 8 or more characters')
    .isLength({
        min: 8
    })
], async (req, res) => {
    const errors = validationResult(req);
    // Sets status to bad request & sends messages
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {
        name,
        email,
        password
    } = req.body;

    try {
        //Testing if use exists
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }

        const avatar = 'image uri here';

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

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
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

module.exports = router;