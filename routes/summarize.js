const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { skills } = req.body;

  console.log('Skills received:', skills);

  if (!skills || skills.trim() === '') {
    return res.status(400).json({ error: 'Skills are required to generate summary' });
  }

  // Normalize skills (remove duplicates, trim)
  const uniqueSkills = [...new Set(
    skills
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0)
  )];

  // Capitalize each skill
  const capitalizedSkills = uniqueSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));

  // Build summary
  let summary = '';

  if (capitalizedSkills.length === 1) {
    summary = `I am skilled in ${capitalizedSkills[0]}. I use this skill to solve practical problems.`;
  } else if (capitalizedSkills.length === 2) {
    summary = `I am skilled in ${capitalizedSkills[0]} and ${capitalizedSkills[1]}. I enjoy applying them to real-world projects.`;
  } else {
    const last = capitalizedSkills.pop();
    summary = `I am skilled in ${capitalizedSkills.join(', ')}, and ${last}. I use these technologies to build modern and user-friendly applications.`;
  }

  res.json({ summary });
});

module.exports = router;
