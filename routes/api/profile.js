const express = require("express");
const router = express();
const mongoose = require("mongoose");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

/**
 * @route GET api/profile
 * @description get current user's profile
 * @access Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    // Look for current user's profile
    Profile.findOne({ user: req.user.id })
      .populate("u ser", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          // No profile found
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        } else {
          // Profile found
          res.json(profile);
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

/**
 * @route GET api/profile/user/:user
 * @description Get a profile by user ID
 * @access Public
 */
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

/**
 * @route GET api/profile/handle/:handle
 * @description Get profile by handle
 * @access Public
 */
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this handle";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err =>
      res.status(404).json({ noprofile: "There is no profile for this handle" })
    );
});

/**
 * @route GET api/profile/all
 * @description Get all profiles
 * @access Public
 */
router.get("/all", (req, res) => {
  let errors = {};
  Profile.find()
    .populate("user", ["name", "avatart"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = "There are no profiles";
        res.status(404).json({ errors });
      } else {
        res.json(profiles);
      }
    })
    .catch(err => {
      res.status(404).json({ noprofile: "There are no profiles" });
    });
});

/**
 * @route POST api/profile
 * @description Create or Edit user profile
 * @access Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into an array
    if (typeof req.body.skills != undefined) {
      profileFields.skills = req.body.skills.split(",");
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.updateOne;
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          } else {
            // Save profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile));
          }
        });
      }
    });
  }
);

/**
 * @route POST api/profile/experience
 * @description add experience to profile
 * @access Private
 */

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      // Validate data
      const { errors, isValid } = validateExperienceInput(req.body);
      if (!isValid) {
        // If data Invalid, return errors
        res.status(400).json(errors);
      } else {
        // Data is Valid -> Build new Experience
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add Experience to Experience Arrray in Profile
        profile.experience.unshift(newExp);
        //Save & Return Profile
        profile.save().then(profile => res.json(profile));
      }
    });
  }
);

/**
 * @route POST api/profile/education
 * @description add education to profile
 * @access Private
 */

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      // Validate data
      const { errors, isValid } = validateEducationInput(req.body);
      if (!isValid) {
        // If data Invalid, return errors
        res.status(400).json(errors);
      } else {
        // Data is Valid -> Build new Experience
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add Experience to Experience Arrray in Profile
        profile.education.unshift(newEdu);
        //Save & Return Profile
        profile.save().then(profile => res.json(profile));
      }
    });
  }
);

/**
 * @route DELETE api/profile/experience/:exp_id
 * @description delete an experience from profile
 * @access Private
 */

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice it out of array
        profile.experience.splice(removeIndex, 1);
        // Save Profile
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

/**
 * @route DELETE api/profile/education/:exp_id
 * @description delete an education from profile
 * @access Private
 */

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice it out of array
        profile.education.splice(removeIndex, 1);
        // Save Profile
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

/**
 * @route DELETE api/profile/
 * @description Delete user & profile
 * @access Private
 */
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
