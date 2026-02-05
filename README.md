# Crisis Response Translator

Breaking language barriers in disaster zones through AI-powered translation.

## Overview

Crisis Response Translator is a web application designed to help emergency responders communicate with disaster victims who speak different languages. By leveraging Gemini API, it analyzes images of handwritten notes, emergency signs and injuries to provide instant translations with medical context and urgency assessment.

## The Problem

During disasters and humanitarian crises, language barriers prevent effective communication between first responders and victims. Critical information gets lost in translation and medical conditions often go unnoticed, urgent needs are deprioritized, and lives are put at risk. Traditional translation apps require clear text input, but in emergency situations, responders often encounter handwritten notes, damaged documents, or signs in unfamiliar scripts.

## The Solution

This application uses computer vision to:
- Extract text from images, including handwritten content
- Translate across 10+ languages with medical terminology accuracy
- Automatically assess urgency levels based on context and keywords
- Identify critical medical terms (insulin, bleeding, allergic, trapped, etc.)

## Features

- **AI Analysis**: Processes images containing text, handwriting, or medical information
- **Real time Translation**: Supports various languages such as English, Italian, Arabic, Chinese, Hindi, Portuguese etc.
- **Urgency Detection**: Automatically classifies situations as low, medium, high, or critical based on content analysis
- **Medical Keyword Extraction**: Flags important medical terms that require immediate attention
- **Responsive Design**: Works across desktop and mobile devices for field use

## Tech Stack

- **Frontend**: React, JavaScript
- **Styling**: Tailwind CSS
- **AI/ML**: Google Gemini Vision API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (get one at https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/crisis-translator.git
cd crisis-translator
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## Usage

1. Select your target language from the dropdown menu
2. Upload an image containing text (emergency sign, medical form, handwritten note, etc.)
3. Click "Analyze & Translate" to process the image
4. Review the results:
   - Detected text and source language
   - Translation to your selected language
   - Urgency level assessment
   - Medical keywords flagged
   - Contextual information
   - Suggested response

## Use Cases

- **Earthquake Response**: Translating handwritten signs from trapped victims indicating location or medical needs
- **Refugee Assistance**: Understanding medical documents and prescriptions in unfamiliar languages
- **Disaster Relief**: Reading emergency signs and messages in affected areas
- **Cross-border Emergencies**: Facilitating communication between multilingual response teams

## Project Structure

```
crisis-translator/
├── public/
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API Integration

The application integrates with Google's Gemini API using a RESTful approach. The API call flow:

1. Image is converted to base64 format in the browser
2. Structured prompt is created with translation requirements
3. POST request sent to Gemini API endpoint with image data
4. Response parsed and displayed to user

No backend server is required - the application makes direct API calls from the frontend. For production deployments, consider adding a backend proxy to better secure API keys.

## Environment Variables

The following environment variables are required:

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

Note: Vite requires environment variables to be prefixed with `VITE_` to be accessible in the client.

## Security Considerations

- API keys are stored in environment variables and not committed to version control
- For production use, implement a backend proxy to hide API keys from client-side code
- Consider adding rate limiting to prevent API quota exhaustion
- Implement domain restrictions on your API key in Google Cloud Console

## Known Limitations

- Requires internet connectivity for API calls
- Image quality affects OCR accuracy
- API rate limits apply based on your Google Cloud quota
- Vision model works best with clear, well-lit images

## Future Improvements

- Add offline mode with cached translations for common phrases
- Implement voice input for verbal translation requests
- Create mobile native apps for iOS and Android
- Add image preprocessing to enhance quality before analysis
- Integrate with existing emergency response systems
- Support additional languages and regional dialects
- Implement user authentication and usage analytics
- Add collaborative features for team-based disaster response

## Contributing

Contributions are welcome. If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add some improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## Acknowledgments

- Built with Gemini API
- Inspired by real world challenges faced during humanitarian crises
- UI components styled with Tailwind CSS

## Contact

For questions or feedback, please open an issue on GitHub or reach out through the repository discussions.

---

This project was created for Gemini Hackathon by Google Deep Mind with the goal of making emergency response more effective across language barriers. While built as a prototype, the vision is to develop this into a production tool that can genuinely help save lives in crisis situations.
```
