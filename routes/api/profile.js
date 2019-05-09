const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  GET api/profile/me
//@desc   Get user profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        //Find profile based on user id && bring in info from User model
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }

        //if profile exists, return profile
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(`Server Error ${err.message}`);
    }
});

module.exports = router;