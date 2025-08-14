export const toolsArray = [
  {
    title: "Satisfaction Survey",
    name: "surveys",
    description: "Quickly collect customer feedback and measure satisfaction.",
    icon: "📝",
    overview: {
      features: [
        "Pre-built Survey Templates: Launch surveys with minimal setup.",
        "Emoji & Star Ratings: Engage users with intuitive rating systems.",
        "Analytics Dashboard: View satisfaction scores and trends.",
        "Anonymity Options: Collect honest feedback securely.",
      ],
      integrations: [
        "Google Sheets",
        "Typeform",
        "Slack",
        "Email Notifications",
      ],
      support: [
        "Knowledge Base",
        "Live Chat Support",
        "User Onboarding Guides",
        "Survey Design Tips",
      ],
    },
  },
];

export const prompts = {
  lessonplan: (formData: FormData) => {
    const title = formData.get("title");
    const gradeLevel = formData.get("gradeLevel");
    const subject = formData.get("subject");

    return `
    You are an expert learning assistant. Generate a comprehensive learning plan based on the following content:
    title: ${title}
    gradeLevel: ${gradeLevel}
    subject: ${subject}

    ${followFormat("learning plan")}
    
    `;
  },
  quizcreator: (formData: FormData) => {
    const title = formData.get("title");
    const gradeLevel = formData.get("gradeLevel");
    const subject = formData.get("subject");
    const numberOfQuestions = formData.get("numberOfQuestions");
    return `
    You are an expert learning assistant. Generate a quiz based on the following content:
    title: ${title}
    gradeLevel: ${gradeLevel}
    subject: ${subject}
    numberOfQuestions: ${numberOfQuestions}

    ${followFormat("quiz")}
    `;
  },
};

const followFormat = (type: string) => {
  return `Choose the appropriate elements to structure the ${type} effectively using TipTap editor possible elements. The content should follow this format:

{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Main Title" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Paragraph content" }]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "List item" }] }]
        }
      ]
    }
    // ... other elements as needed
  ]
}

Use your judgment to decide where to use each element type to create a well-structured and readable lesson plan.`;
};
