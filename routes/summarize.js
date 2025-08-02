const express = require("express");
const router = express.Router();
const dataset = require("../data/dataset");

router.post("/", (req, res) => {
  const { skills } = req.body;

  console.log("Skills received:", skills);

  if (!skills || skills.trim() === "") {
    return res
      .status(400)
      .json({ error: "Skills are required to generate summary" });
  }

  // Normalize and clean skills
  const uniqueSkills = [
    ...new Set(
      skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0)
    ),
  ];

  // Default fallback
  let matchedCategory = null;

  // Match skills with dataset categories
  for (const category of dataset.categories) {
    if (uniqueSkills.some((skill) => category.skills.includes(skill))) {
      matchedCategory = category;
      break;
    }
  }

  let summary = "";

  if (matchedCategory) {
    // Capitalize skills
    const capitalizedSkills = uniqueSkills.map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1)
    );
    const skillsText =
      capitalizedSkills.length > 1
        ? capitalizedSkills.slice(0, -1).join(", ") +
          " and " +
          capitalizedSkills.slice(-1)
        : capitalizedSkills[0];

    // Pick a random template
    const template =
      matchedCategory.templates[
        Math.floor(Math.random() * matchedCategory.templates.length)
      ];

    summary = template.replace("{skills}", skillsText);
  } else {
    // Generic fallback if no category matches
    const capitalizedSkills = uniqueSkills.map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1)
    );
    summary =
      capitalizedSkills.length === 1
        ? `I am skilled in ${capitalizedSkills[0]}. I use this skill to solve real-world problems.`
        : `I am skilled in ${capitalizedSkills.join(
            ", "
          )}. I use these skills to deliver quality work across various projects.`;
  }

  return res.status(200).json({ summary });
});

module.exports = router;
