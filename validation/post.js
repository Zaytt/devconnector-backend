const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 1, max: 300 }))
    errors.text = "Comment text is too long, max 300 chars allowed";

  if (Validator.isEmpty(data.text)) errors.text = "Comment text is required";

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
