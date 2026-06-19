// Auto-generated bilingual content for SymptomsEase AI website.
// EN drafted + AR translated by a multi-agent workflow; grounded in the project facts.
window.CONTENT = {
  "en": [
    {
      "key": "hero",
      "title": "SymptomsEase AI",
      "lead": "Speak your symptoms. Get a preliminary screening — fully offline.",
      "paragraphs": [
        "Record a short spoken description of your symptoms and SymptomsEase AI transcribes it on-device, then a neural network classifies it across 7 disease categories. It surfaces the two most likely conditions with confidence percentages — no internet required.",
        "An academic proof-of-concept from the University of Jeddah, for research and education only. Not a certified medical device — always consult a licensed clinician."
      ],
      "ctaPrimary": "Download for Windows",
      "ctaSecondary": "How it works",
      "note": "Academic proof-of-concept. Not for real diagnosis."
    },
    {
      "key": "overview",
      "title": "Overview",
      "lead": "SymptomsEase AI turns a short spoken description of your symptoms into a fast, low-cost preliminary health screening that runs entirely on your own computer.",
      "paragraphs": [
        "SymptomsEase AI is a Windows desktop application that listens to a brief spoken description of your symptoms, transcribes it to text completely offline, and uses a neural network to suggest the two most likely conditions from seven disease categories, each shown with a confidence percentage. The goal is accessible, low-cost early screening: instead of filling out forms, a user simply records a few sentences in plain English and receives an immediate, easy-to-read result.",
        "The application was built as a senior graduation project at the University of Jeddah by Feras Alkhodari (Backend Engineer, DevOps, Application Security). It combines offline speech-to-text, classic text preprocessing, and a trained Keras/TensorFlow model into a single self-contained program, packaged as a downloadable .exe so users do not need to install Python or configure any tools.",
        "Everything happens locally on the device. Audio recording, transcription, and classification all run offline, so no internet connection is required and no recordings or transcripts leave the computer. SymptomsEase AI is an academic proof-of-concept for research and education only; it is not a certified medical device and must never be used for real diagnosis. Always consult a licensed clinician for medical advice."
      ],
      "note": "Academic proof-of-concept for research and education only. Not a certified medical device and not for real diagnosis; always consult a licensed clinician."
    },
    {
      "key": "features",
      "title": "Features",
      "lead": "SymptomsEase AI turns a short spoken description of symptoms into a preliminary, on-device screening result — built to run entirely offline on a standard Windows PC.",
      "bullets": [
        {
          "title": "Offline Speech-to-Text",
          "desc": "Records your spoken symptoms and transcribes them to text locally with the Vosk model — no internet, no cloud."
        },
        {
          "title": "7-Disease Classification",
          "desc": "A Keras/TensorFlow neural network sorts your description into one of 7 categories, from Upper Respiratory Tract Infection to Pneumonia."
        },
        {
          "title": "Top-2 with Confidence Scores",
          "desc": "Shows the two most likely conditions with softmax confidence percentages, displayed as clear confidence bars."
        },
        {
          "title": "Session Management",
          "desc": "Each session's recordings and transcripts are saved inside the app folder and organized in a sidebar for easy review."
        },
        {
          "title": "Modern Dark UI",
          "desc": "A polished 'Midnight Violet' Tkinter interface with deep indigo backgrounds, violet-to-blue gradient buttons, and a live recording indicator."
        },
        {
          "title": "100% Offline & Private",
          "desc": "Speech-to-text and classification both run on your machine — your audio and transcripts never leave the device."
        },
        {
          "title": "One-Click Windows App",
          "desc": "Packaged as a downloadable .exe with PyInstaller — extract the folder and double-click to run, with no Python installation needed."
        },
        {
          "title": "Transparent ML Evaluation",
          "desc": "Reaches 95% test accuracy with full per-class precision, recall, and F1 scores published openly, including weaker classes like Pneumonia (F1 0.77)."
        }
      ],
      "note": "SymptomsEase AI is an academic proof-of-concept, not a certified medical device. It is for research and education only — never for real diagnosis. Always consult a licensed clinician."
    },
    {
      "key": "how",
      "title": "How It Works",
      "lead": "From a short spoken description of symptoms to two ranked conditions, every step runs locally on your PC in six stages.",
      "steps": [
        {
          "title": "1. Record",
          "desc": "You speak a short description of your symptoms while the app captures mono microphone audio at 16 kHz using PyAudio."
        },
        {
          "title": "2. Transcribe",
          "desc": "The audio is converted to text fully offline by the Vosk speech-to-text model (vosk-model-small-en-us-0.15), so no internet connection is required."
        },
        {
          "title": "3. Preprocess",
          "desc": "The transcript is tokenized, lowercased, stripped of stop-words, and lemmatized to normalize it for the model."
        },
        {
          "title": "4. Vectorize (Bag-of-Words)",
          "desc": "The cleaned text is turned into a Bag-of-Words count vector over a fixed 2,730-word vocabulary."
        },
        {
          "title": "5. Scale",
          "desc": "The vector's features are normalized with a scikit-learn MinMaxScaler so they match the range the model was trained on."
        },
        {
          "title": "6. Classify (Top-2)",
          "desc": "A Keras/TensorFlow neural network outputs a softmax over the 7 disease categories, and the app displays the two most likely conditions with confidence percentages."
        }
      ],
      "note": "SymptomsEase AI is an academic proof-of-concept, not a certified medical device. It is for research and education only and must never be used for real diagnosis; always consult a licensed clinician."
    },
    {
      "key": "model",
      "title": "The AI Model",
      "lead": "A fully offline two-stage pipeline: local speech-to-text, then a compact neural network that classifies symptoms into one of 7 disease categories.",
      "paragraphs": [
        "SymptomsEase AI runs entirely on the user's machine with no internet connection. Speech is first converted to text by the Vosk offline speech recognition engine, using the \"vosk-model-small-en-us-0.15\" English model. Because transcription happens locally, audio never leaves the device, keeping the screening process private and usable without network access.",
        "The transcribed text is then cleaned and vectorized (tokenization, lowercasing, stop-word removal, and lemmatization), turned into a Bag-of-Words count vector over a fixed 2,730-word vocabulary, and scaled with a scikit-learn MinMaxScaler. A Keras/TensorFlow neural network produces a softmax probability across the 7 disease classes, and the app surfaces the two most likely conditions with confidence percentages."
      ],
      "bullets": [
        {
          "title": "Offline speech-to-text (Vosk)",
          "desc": "Transcription uses the \"vosk-model-small-en-us-0.15\" English model, running locally with no internet required."
        },
        {
          "title": "Input layer: 2,730 features",
          "desc": "A Bag-of-Words count vector over a fixed 2,730-word vocabulary, scaled with a scikit-learn MinMaxScaler."
        },
        {
          "title": "Hidden Dense layers (ReLU)",
          "desc": "Five fully connected ReLU layers with 116, 36, 116, 84, and 84 units."
        },
        {
          "title": "Output layer: Dense(7) with softmax",
          "desc": "Produces a probability distribution over the 7 disease categories; the app displays the top 2 with confidence."
        },
        {
          "title": "Optimizer: RMSprop",
          "desc": "Trained with the RMSprop optimizer."
        },
        {
          "title": "Loss: categorical cross-entropy",
          "desc": "Standard multi-class classification loss over the 7 labeled categories."
        },
        {
          "title": "Architecture search: Keras Tuner",
          "desc": "Layer count and width were tuned via random search over 3-10 hidden layers and 4-128 neurons per layer."
        },
        {
          "title": "Saved with Keras 3.6.0",
          "desc": "A Keras Sequential model on the TensorFlow backend."
        }
      ],
      "note": "This is an academic proof-of-concept, not a certified medical device. It is intended for research and education only and must never be used for real diagnosis. Always consult a licensed clinician."
    },
    {
      "key": "dataset",
      "title": "Dataset & Preprocessing",
      "lead": "The classifier learns from labeled patient-doctor dialogs, with class balancing and a fixed text-to-features pipeline applied before training.",
      "paragraphs": [
        "The model was trained on a dataset of patient-doctor dialogs, where each conversation is labeled with one of seven disease categories: Upper Respiratory Tract Infection, Dermatitis, Gastritis, Rhinitis, Viral Hepatitis, Enteritis, and Pneumonia. Each dialog captures a spoken-style description of symptoms, which makes it a natural fit for an audio-driven screening tool where users describe how they feel in their own words.",
        "The raw dataset is heavily imbalanced across these seven labels. Upper Respiratory Tract Infection (1,734 samples) and Dermatitis (1,400 samples) dominate, while Pneumonia (152 samples) and Viral Hepatitis (221 samples) are sparsely represented. Training directly on this distribution would bias the network toward the majority classes and weaken recognition of the rarer conditions.",
        "To address this, the dataset was balanced through undersampling: every class was reduced to 152 samples, matching the smallest class (Pneumonia). The balanced data was then split 80% for training and 20% for testing, with features scaled using a scikit-learn MinMaxScaler and early stopping (patience of 4 epochs) applied during training to limit overfitting."
      ],
      "table": {
        "caption": "Original per-class sample counts (before balancing)",
        "headers": [
          "Class",
          "Disease",
          "Samples"
        ],
        "rows": [
          [
            "1",
            "Upper Respiratory Tract Infection",
            "1734"
          ],
          [
            "2",
            "Dermatitis",
            "1400"
          ],
          [
            "3",
            "Gastritis",
            "547"
          ],
          [
            "4",
            "Rhinitis",
            "519"
          ],
          [
            "5",
            "Viral Hepatitis",
            "221"
          ],
          [
            "6",
            "Enteritis",
            "249"
          ],
          [
            "7",
            "Pneumonia",
            "152"
          ]
        ]
      },
      "bullets": [
        {
          "title": "Tokenization",
          "desc": "The transcribed text is split into individual word tokens."
        },
        {
          "title": "Lowercasing",
          "desc": "All tokens are normalized to lowercase so casing does not create duplicate features."
        },
        {
          "title": "Stop-word removal",
          "desc": "Common, low-information words are filtered out to keep the signal focused on symptom terms."
        },
        {
          "title": "Lemmatization",
          "desc": "Words are reduced to their base form so variants map to a single feature."
        },
        {
          "title": "Bag-of-Words",
          "desc": "The cleaned tokens are encoded as a count vector over a fixed 2,730-word vocabulary, which becomes the model input."
        }
      ],
      "note": "Counts are undersampled to 152 samples per class to produce a balanced training set across all seven categories."
    },
    {
      "key": "results",
      "title": "Results & Evaluation",
      "lead": "The classifier reaches 95% overall accuracy across the seven disease categories.",
      "paragraphs": [
        "The neural network reaches 95% overall accuracy across the seven disease categories. The table below reports precision, recall, F1-score, and support (the number of samples in each class) over the full labeled dataset of 4,822 samples. Class balancing by undersampling was applied to the training set, while these metrics are reported across the original labeled data."
      ],
      "table": {
        "caption": "Per-class classification metrics on the test set (overall accuracy: 95%).",
        "headers": [
          "Class",
          "Disease",
          "Precision",
          "Recall",
          "F1-score",
          "Support"
        ],
        "rows": [
          [
            "1",
            "Upper Respiratory Tract Infection",
            "0.93",
            "0.97",
            "0.95",
            "1734"
          ],
          [
            "2",
            "Dermatitis",
            "0.99",
            "0.99",
            "0.99",
            "1400"
          ],
          [
            "3",
            "Gastritis",
            "0.96",
            "0.93",
            "0.95",
            "547"
          ],
          [
            "4",
            "Rhinitis",
            "0.94",
            "0.87",
            "0.90",
            "519"
          ],
          [
            "5",
            "Viral Hepatitis",
            "0.99",
            "0.99",
            "0.99",
            "221"
          ],
          [
            "6",
            "Enteritis",
            "0.88",
            "0.92",
            "0.90",
            "249"
          ],
          [
            "7",
            "Pneumonia",
            "0.83",
            "0.72",
            "0.77",
            "152"
          ]
        ]
      },
      "note": "Macro average: 0.93 precision / 0.91 recall / 0.92 F1-score. Weighted average: 0.95 precision / 0.95 recall / 0.95 F1-score (total support 4,822). Most classes perform strongly, with Dermatitis and Viral Hepatitis at 0.99 F1. Pneumonia (class 7) is the weakest category, with an F1-score of 0.77, driven mainly by lower recall (0.72) on its 152 supporting samples."
    },
    {
      "key": "stack",
      "title": "Technology Stack",
      "lead": "The tools behind SymptomsEase AI, from the offline speech pipeline to the neural network and the packaged desktop build.",
      "bullets": [
        {
          "title": "Python 3.10",
          "desc": "Core language tying the entire application together."
        },
        {
          "title": "Tkinter",
          "desc": "Builds the desktop GUI and the dark Midnight Violet interface."
        },
        {
          "title": "PyAudio",
          "desc": "Captures microphone audio as mono 16 kHz recordings."
        },
        {
          "title": "Vosk",
          "desc": "Offline English speech-to-text using the vosk-model-small-en-us-0.15 model, no internet required."
        },
        {
          "title": "TensorFlow / Keras",
          "desc": "Runs the Keras Sequential neural network that classifies symptoms into the 7 disease categories."
        },
        {
          "title": "scikit-learn",
          "desc": "Provides the MinMaxScaler for feature scaling before inference."
        },
        {
          "title": "NumPy",
          "desc": "Handles numerical arrays and the Bag-of-Words feature vectors."
        },
        {
          "title": "Pillow",
          "desc": "Loads and renders the UI images and icons."
        },
        {
          "title": "PyInstaller",
          "desc": "Packages the app into a standalone Windows .exe, so users need no Python install."
        }
      ]
    },
    {
      "key": "install",
      "title": "Install & Get Started",
      "lead": "SymptomsEase AI runs entirely on your Windows PC. There is no installer and no need for Python. Download, extract, and run.",
      "steps": [
        {
          "title": "Download the ZIP",
          "desc": "Download the SymptomsEase AI package. It arrives as a single ZIP archive containing the full \"SymptomsEaseAI\" folder."
        },
        {
          "title": "Extract to a writable location",
          "desc": "Unzip the entire \"SymptomsEaseAI\" folder to a place you can write to, such as your Desktop or Documents. Do not extract it inside C:\\Program Files, since the app saves sessions next to itself and needs write access."
        },
        {
          "title": "Run SymptomsEaseAI.exe",
          "desc": "Open the extracted folder and double-click \"SymptomsEaseAI.exe\". No installation or Python is required; the app starts directly."
        },
        {
          "title": "Get past Windows SmartScreen",
          "desc": "The app is not code-signed, so Windows SmartScreen may show \"Windows protected your PC\". Click \"More info\", then \"Run anyway\" to launch it. This appears because the file is unsigned, not because of a problem with the app."
        },
        {
          "title": "Start a New Session",
          "desc": "In the app, click \"New Session\" to begin. Each session keeps its recording and transcript together."
        },
        {
          "title": "Record your symptoms",
          "desc": "Click \"Record\" and speak a short description of your symptoms into your microphone, then click \"Stop\". The app transcribes your speech to text fully offline."
        },
        {
          "title": "Analyze the results",
          "desc": "Click \"Analyze\" to run the classification. The app displays the two most likely conditions, each with a confidence bar. Sessions are saved inside the app folder for later reference."
        }
      ],
      "note": "SymptomsEase AI is an academic proof-of-concept, not a certified medical device. It is for research and education only and must never be used for real diagnosis. Always consult a licensed clinician.",
      "ctaPrimary": "Download for Windows",
      "ctaSecondary": "System requirements"
    },
    {
      "key": "requirements",
      "title": "Computer Requirements",
      "lead": "SymptomsEase AI runs fully offline on standard Windows PCs — no internet connection or Python installation is required.",
      "bullets": [
        {
          "title": "Operating system",
          "desc": "Windows 10 or 11, 64-bit."
        },
        {
          "title": "Processor",
          "desc": "Any modern x86-64 CPU with AVX2 support (essentially all PCs from around 2014 onward); an Intel i5 or equivalent is recommended."
        },
        {
          "title": "Memory",
          "desc": "4 GB RAM minimum, 8 GB recommended."
        },
        {
          "title": "Disk space",
          "desc": "About 2 GB free for the unpacked app."
        },
        {
          "title": "Microphone",
          "desc": "A working microphone is required only when recording symptoms."
        },
        {
          "title": "Connectivity",
          "desc": "Fully offline — no internet connection is needed to use the app."
        }
      ]
    },
    {
      "key": "faq",
      "title": "Frequently Asked Questions",
      "lead": "Answers to common questions about how SymptomsEase AI works, what it can do, and its limits.",
      "bullets": [
        {
          "title": "Is this a medical diagnosis?",
          "desc": "No. SymptomsEase AI is an academic proof-of-concept and a graduation project, not a certified medical device. It is intended for research and education only and must never be used for real diagnosis. Always consult a licensed clinician for any medical concern."
        },
        {
          "title": "Is my data private, and does it need an internet connection?",
          "desc": "It is fully offline. Recording, speech-to-text transcription, and classification all run locally on your computer, so no internet connection is required and your audio and transcripts never leave your machine. Sessions (recordings and transcripts) are saved inside the app folder."
        },
        {
          "title": "What language does it understand?",
          "desc": "English only. Speech is transcribed locally using the Vosk model \"vosk-model-small-en-us-0.15\" (English), which runs entirely on your device without any internet access."
        },
        {
          "title": "Why does Windows warn me when I open it?",
          "desc": "Because the app is not code-signed, Windows SmartScreen may show \"Windows protected your PC\" the first time you run it. Click \"More info\" and then \"Run anyway\" to continue. This is expected for an unsigned academic build."
        },
        {
          "title": "Which conditions can it detect?",
          "desc": "It classifies your described symptoms into one of 7 categories and shows the two most likely with confidence percentages: Upper Respiratory Tract Infection, Dermatitis, Gastritis, Rhinitis, Viral Hepatitis, Enteritis, and Pneumonia. On the test set, overall accuracy was 95%, though Pneumonia is the weakest class (F1-score 0.77)."
        },
        {
          "title": "Do I need to install Python or anything else?",
          "desc": "No. The app is packaged as a downloadable Windows .exe with everything included, so no Python or installation is required. Just extract the \"SymptomsEaseAI\" folder to a writable location (such as Desktop or Documents, not inside C:\\Program Files) and double-click \"SymptomsEaseAI.exe\". A working microphone is only needed for recording."
        }
      ],
      "note": "SymptomsEase AI is an academic proof-of-concept for research and education only. It is not a certified medical device and must never be used for real diagnosis. Always consult a licensed clinician."
    },
    {
      "key": "disclaimer",
      "title": "Medical Disclaimer",
      "paragraphs": [
        "SymptomsEase AI is an academic proof-of-concept built as a university graduation project; it is not a certified medical device and is intended strictly for research and educational purposes. Its predictions are preliminary screening estimates only and must never be used for real diagnosis or as a substitute for professional medical advice. Always consult a licensed clinician for any health concern, diagnosis, or treatment decision."
      ],
      "note": "For research and education only. Not for clinical use."
    },
    {
      "key": "download",
      "title": "Download SymptomsEase AI",
      "lead": "Get the desktop app for Windows. No installation and no Python required, it runs fully offline.",
      "paragraphs": [
        "Download the app as a ZIP, then extract the whole SymptomsEaseAI folder to a writable location such as your Desktop or Documents (not inside C:\\Program Files). Open the folder and double-click SymptomsEaseAI.exe to start."
      ],
      "ctaPrimary": "Download for Windows",
      "ctaSecondary": "View setup steps",
      "note": "Windows 10/11, 64-bit. ~2 GB free disk space for the unpacked app. Not code-signed, so SmartScreen may prompt: click More info, then Run anyway."
    }
  ],
  "ar": [
    {
      "key": "hero",
      "title": "SymptomsEase AI",
      "lead": "تحدّث عن أعراضك. واحصل على فحص أولي — دون اتصال بالإنترنت تمامًا.",
      "paragraphs": [
        "سجّل وصفًا منطوقًا قصيرًا لأعراضك، فيقوم تطبيق SymptomsEase AI بتفريغه نصيًا على جهازك مباشرة، ثم تصنّفه شبكة عصبية ضمن 7 فئات مرضية. يعرض لك الحالتين الأكثر احتمالًا مع نسب الثقة — دون الحاجة إلى الإنترنت.",
        "نموذج أكاديمي لإثبات المفهوم من جامعة جدة، للبحث والتعليم فقط. ليس جهازًا طبيًا معتمدًا — استشر دائمًا طبيبًا مرخّصًا."
      ],
      "ctaPrimary": "التنزيل لنظام Windows",
      "ctaSecondary": "كيف يعمل",
      "note": "نموذج أكاديمي لإثبات المفهوم. ليس مخصصًا للتشخيص الفعلي."
    },
    {
      "key": "overview",
      "title": "نظرة عامة",
      "lead": "يحوّل تطبيق SymptomsEase AI وصفًا منطوقًا قصيرًا لأعراضك إلى فحص صحي أولي سريع ومنخفض التكلفة يعمل بالكامل على جهاز الكمبيوتر الخاص بك.",
      "paragraphs": [
        "تطبيق SymptomsEase AI هو تطبيق سطح مكتب لنظام Windows يستمع إلى وصف منطوق موجز لأعراضك، ويفرّغه نصيًا دون اتصال بالإنترنت تمامًا، ويستخدم شبكة عصبية لاقتراح الحالتين الأكثر احتمالًا من بين سبع فئات مرضية، تُعرض كل منهما مع نسبة ثقة. والهدف هو فحص مبكر ميسور التكلفة وسهل الوصول إليه: فبدلًا من تعبئة النماذج، يكتفي المستخدم بتسجيل بضع جُمل باللغة الإنجليزية البسيطة ليحصل على نتيجة فورية وسهلة القراءة.",
        "طُوّر التطبيق كمشروع تخرّج جامعي في جامعة جدة على يد فراس الخضري (مهندس واجهات خلفية، عمليات تطوير DevOps، وأمن التطبيقات). وهو يجمع بين تحويل الكلام إلى نص دون اتصال بالإنترنت، والمعالجة النصية المسبقة التقليدية، ونموذج Keras/TensorFlow مُدرَّب، ضمن برنامج واحد مكتفٍ ذاتيًا، معبّأ كملف .exe قابل للتنزيل بحيث لا يحتاج المستخدمون إلى تثبيت Python أو إعداد أي أدوات.",
        "كل شيء يحدث محليًا على الجهاز. فتسجيل الصوت والتفريغ النصي والتصنيف، جميعها تعمل دون اتصال بالإنترنت، ولذلك لا يلزم أي اتصال بالشبكة ولا تغادر أي تسجيلات أو نصوص الكمبيوتر. تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم للبحث والتعليم فقط؛ وهو ليس جهازًا طبيًا معتمدًا ويجب ألا يُستخدم أبدًا للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا للحصول على المشورة الطبية."
      ],
      "note": "نموذج أكاديمي لإثبات المفهوم للبحث والتعليم فقط. ليس جهازًا طبيًا معتمدًا وليس مخصصًا للتشخيص الفعلي؛ استشر دائمًا طبيبًا مرخّصًا."
    },
    {
      "key": "features",
      "title": "المزايا",
      "lead": "يحوّل تطبيق SymptomsEase AI وصفًا منطوقًا قصيرًا للأعراض إلى نتيجة فحص أولية على الجهاز — مصمّم للعمل بالكامل دون اتصال بالإنترنت على جهاز كمبيوتر Windows عادي.",
      "bullets": [
        {
          "title": "تحويل الكلام إلى نص دون اتصال",
          "desc": "يسجّل أعراضك المنطوقة ويفرّغها نصيًا محليًا باستخدام نموذج Vosk — دون إنترنت ودون سحابة."
        },
        {
          "title": "تصنيف 7 أمراض",
          "desc": "تصنّف شبكة عصبية من Keras/TensorFlow وصفك ضمن إحدى 7 فئات، بدءًا من التهاب الجهاز التنفسي العلوي (Upper Respiratory Tract Infection) ووصولًا إلى الالتهاب الرئوي (Pneumonia)."
        },
        {
          "title": "أعلى حالتين مع درجات الثقة",
          "desc": "يعرض الحالتين الأكثر احتمالًا مع نسب ثقة softmax، معروضة على هيئة أشرطة ثقة واضحة."
        },
        {
          "title": "إدارة الجلسات",
          "desc": "تُحفظ تسجيلات ونصوص كل جلسة داخل مجلد التطبيق، وتُنظَّم في شريط جانبي لسهولة المراجعة."
        },
        {
          "title": "واجهة داكنة عصرية",
          "desc": "واجهة Tkinter أنيقة بطابع 'Midnight Violet' بخلفيات نيلية عميقة، وأزرار بتدرّج لوني من البنفسجي إلى الأزرق، ومؤشّر تسجيل مباشر."
        },
        {
          "title": "تعمل دون اتصال بنسبة 100% وتحفظ الخصوصية",
          "desc": "يعمل كل من تحويل الكلام إلى نص والتصنيف على جهازك — ولا يغادر الصوت ولا النصوص الجهاز أبدًا."
        },
        {
          "title": "تطبيق Windows بنقرة واحدة",
          "desc": "معبّأ كملف .exe قابل للتنزيل باستخدام PyInstaller — فك ضغط المجلد وانقر نقرًا مزدوجًا للتشغيل، دون الحاجة إلى تثبيت Python."
        },
        {
          "title": "تقييم شفّاف لتعلّم الآلة",
          "desc": "يبلغ دقة اختبار 95% مع نشر درجات الدقة (precision) والاستدعاء (recall) ومقياس F1 لكل فئة بشكل علني وكامل، بما في ذلك الفئات الأضعف مثل الالتهاب الرئوي (F1 0.77)."
        }
      ],
      "note": "تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم، وليس جهازًا طبيًا معتمدًا. وهو للبحث والتعليم فقط — لا للتشخيص الفعلي أبدًا. استشر دائمًا طبيبًا مرخّصًا."
    },
    {
      "key": "how",
      "title": "كيف يعمل",
      "lead": "من وصف منطوق قصير للأعراض إلى حالتين مرتّبتين، تعمل كل خطوة محليًا على جهازك عبر ست مراحل.",
      "steps": [
        {
          "title": "1. التسجيل",
          "desc": "تنطق بوصف قصير لأعراضك بينما يلتقط التطبيق صوت الميكروفون الأحادي بمعدل 16 كيلوهرتز باستخدام PyAudio."
        },
        {
          "title": "2. التفريغ النصي",
          "desc": "يُحوَّل الصوت إلى نص دون اتصال بالإنترنت تمامًا بواسطة نموذج Vosk لتحويل الكلام إلى نص (vosk-model-small-en-us-0.15)، ولذلك لا يلزم أي اتصال بالإنترنت."
        },
        {
          "title": "3. المعالجة المسبقة",
          "desc": "يُجزّأ النص إلى وحدات (tokenization)، ويُحوَّل إلى أحرف صغيرة، وتُزال منه كلمات التوقف، ويُختزل إلى جذوره الأساسية (lemmatization) لتطبيعه من أجل النموذج."
        },
        {
          "title": "4. التمثيل المتجهي (Bag-of-Words)",
          "desc": "يُحوَّل النص المنقّى إلى متجه عددي بنهج حقيبة الكلمات (Bag-of-Words) على مفردات ثابتة قوامها 2,730 كلمة."
        },
        {
          "title": "5. القياس (Scaling)",
          "desc": "تُطبَّع سمات المتجه باستخدام MinMaxScaler من scikit-learn بحيث تتطابق مع النطاق الذي دُرِّب عليه النموذج."
        },
        {
          "title": "6. التصنيف (أعلى حالتين)",
          "desc": "تُخرج شبكة عصبية من Keras/TensorFlow توزيع softmax على فئات الأمراض الـ7، ويعرض التطبيق الحالتين الأكثر احتمالًا مع نسب الثقة."
        }
      ],
      "note": "تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم، وليس جهازًا طبيًا معتمدًا. وهو للبحث والتعليم فقط ويجب ألا يُستخدم أبدًا للتشخيص الفعلي؛ استشر دائمًا طبيبًا مرخّصًا."
    },
    {
      "key": "model",
      "title": "نموذج الذكاء الاصطناعي",
      "lead": "مسار من مرحلتين يعمل بالكامل دون اتصال: تحويل الكلام إلى نص محليًا، ثم شبكة عصبية مدمجة تصنّف الأعراض ضمن إحدى 7 فئات مرضية.",
      "paragraphs": [
        "يعمل تطبيق SymptomsEase AI بالكامل على جهاز المستخدم دون أي اتصال بالإنترنت. يُحوَّل الكلام أولًا إلى نص بواسطة محرّك Vosk للتعرّف على الكلام دون اتصال، باستخدام النموذج الإنجليزي \"vosk-model-small-en-us-0.15\". وبما أن التفريغ النصي يحدث محليًا، فإن الصوت لا يغادر الجهاز أبدًا، مما يحافظ على خصوصية عملية الفحص ويجعلها قابلة للاستخدام دون الوصول إلى الشبكة.",
        "ثم يُنقّى النص المُفرّغ ويُحوَّل إلى متجه (تجزئة، وتحويل إلى أحرف صغيرة، وإزالة كلمات التوقف، واختزال إلى الجذور الأساسية)، ويُحوَّل إلى متجه عددي بنهج حقيبة الكلمات (Bag-of-Words) على مفردات ثابتة قوامها 2,730 كلمة، ويُقاس باستخدام MinMaxScaler من scikit-learn. تُنتج شبكة عصبية من Keras/TensorFlow احتمالًا بنهج softmax على فئات الأمراض الـ7، ويُبرز التطبيق الحالتين الأكثر احتمالًا مع نسب الثقة."
      ],
      "bullets": [
        {
          "title": "تحويل الكلام إلى نص دون اتصال (Vosk)",
          "desc": "يستخدم التفريغ النصي النموذج الإنجليزي \"vosk-model-small-en-us-0.15\"، ويعمل محليًا دون الحاجة إلى الإنترنت."
        },
        {
          "title": "طبقة الإدخال: 2,730 سمة",
          "desc": "متجه عددي بنهج حقيبة الكلمات (Bag-of-Words) على مفردات ثابتة قوامها 2,730 كلمة، مقيس باستخدام MinMaxScaler من scikit-learn."
        },
        {
          "title": "طبقات Dense الخفية (ReLU)",
          "desc": "خمس طبقات متصلة بالكامل بدالة ReLU بأعداد وحدات 116 و36 و116 و84 و84."
        },
        {
          "title": "طبقة الإخراج: Dense(7) بدالة softmax",
          "desc": "تُنتج توزيعًا احتماليًا على فئات الأمراض الـ7؛ ويعرض التطبيق أعلى حالتين مع الثقة."
        },
        {
          "title": "المُحسِّن: RMSprop",
          "desc": "دُرِّب باستخدام مُحسِّن RMSprop."
        },
        {
          "title": "الخسارة: الإنتروبيا المتقاطعة الفئوية",
          "desc": "دالة خسارة تصنيف متعدد الفئات قياسية على الفئات السبع المُعنونة."
        },
        {
          "title": "البحث عن البنية: Keras Tuner",
          "desc": "ضُبط عدد الطبقات وعرضها عبر بحث عشوائي على نطاق من 3 إلى 10 طبقات خفية ومن 4 إلى 128 عصبونًا لكل طبقة."
        },
        {
          "title": "مُحفوظ بإصدار Keras 3.6.0",
          "desc": "نموذج Keras Sequential على خلفية TensorFlow."
        }
      ],
      "note": "هذا نموذج أكاديمي لإثبات المفهوم، وليس جهازًا طبيًا معتمدًا. وهو مخصّص للبحث والتعليم فقط ويجب ألا يُستخدم أبدًا للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا."
    },
    {
      "key": "dataset",
      "title": "مجموعة البيانات والمعالجة المسبقة",
      "lead": "يتعلّم المُصنِّف من حوارات مُعنونة بين المرضى والأطباء، مع تطبيق موازنة الفئات ومسار ثابت لتحويل النص إلى سمات قبل التدريب.",
      "paragraphs": [
        "دُرِّب النموذج على مجموعة بيانات من حوارات بين المرضى والأطباء، حيث يُعنون كل حوار بإحدى سبع فئات مرضية: التهاب الجهاز التنفسي العلوي، والتهاب الجلد، والتهاب المعدة، والتهاب الأنف، والتهاب الكبد الفيروسي، والتهاب الأمعاء، والالتهاب الرئوي. ويلتقط كل حوار وصفًا للأعراض بأسلوب منطوق، مما يجعله مناسبًا بطبيعته لأداة فحص تعتمد على الصوت يصف فيها المستخدمون شعورهم بكلماتهم الخاصة.",
        "تتّسم مجموعة البيانات الأولية بعدم توازن كبير عبر هذه العناوين السبعة. فالتهاب الجهاز التنفسي العلوي (1,734 عيّنة) والتهاب الجلد (1,400 عيّنة) يهيمنان، بينما يكون الالتهاب الرئوي (152 عيّنة) والتهاب الكبد الفيروسي (221 عيّنة) ضعيفي التمثيل. والتدريب مباشرةً على هذا التوزيع من شأنه أن يجعل الشبكة منحازة نحو الفئات الأكثر شيوعًا ويضعف التعرّف على الحالات الأندر.",
        "ولمعالجة ذلك، وُوزِنت مجموعة البيانات عبر تقليل العيّنات (undersampling): خُفِّضت كل فئة إلى 152 عيّنة، مطابِقةً لأصغر فئة (الالتهاب الرئوي). ثم قُسِّمت البيانات المتوازنة بنسبة 80% للتدريب و20% للاختبار، مع قياس السمات باستخدام MinMaxScaler من scikit-learn وتطبيق الإيقاف المبكر (صبر مقداره 4 حقب) أثناء التدريب للحدّ من فرط التخصيص."
      ],
      "table": {
        "caption": "أعداد العيّنات الأصلية لكل فئة (قبل الموازنة)",
        "headers": [
          "الفئة",
          "المرض",
          "العيّنات"
        ],
        "rows": [
          [
            "1",
            "التهاب الجهاز التنفسي العلوي (Upper Respiratory Tract Infection)",
            "1734"
          ],
          [
            "2",
            "التهاب الجلد (Dermatitis)",
            "1400"
          ],
          [
            "3",
            "التهاب المعدة (Gastritis)",
            "547"
          ],
          [
            "4",
            "التهاب الأنف (Rhinitis)",
            "519"
          ],
          [
            "5",
            "التهاب الكبد الفيروسي (Viral Hepatitis)",
            "221"
          ],
          [
            "6",
            "التهاب الأمعاء (Enteritis)",
            "249"
          ],
          [
            "7",
            "الالتهاب الرئوي (Pneumonia)",
            "152"
          ]
        ]
      },
      "bullets": [
        {
          "title": "التجزئة (Tokenization)",
          "desc": "يُقسَّم النص المُفرّغ إلى وحدات كلمات منفردة."
        },
        {
          "title": "التحويل إلى أحرف صغيرة",
          "desc": "تُطبَّع جميع الوحدات إلى أحرف صغيرة بحيث لا تُنشئ حالة الأحرف سمات مكرّرة."
        },
        {
          "title": "إزالة كلمات التوقف",
          "desc": "تُرشَّح الكلمات الشائعة قليلة المعلومات لإبقاء الإشارة مركّزة على مصطلحات الأعراض."
        },
        {
          "title": "الاختزال إلى الجذور (Lemmatization)",
          "desc": "تُختزل الكلمات إلى صيغتها الأساسية بحيث تُربط الصيغ المختلفة بسمة واحدة."
        },
        {
          "title": "حقيبة الكلمات (Bag-of-Words)",
          "desc": "تُرمَّز الوحدات المنقّاة كمتجه عددي على مفردات ثابتة قوامها 2,730 كلمة، ليصبح هو مُدخل النموذج."
        }
      ],
      "note": "خُفِّضت الأعداد عبر تقليل العيّنات إلى 152 عيّنة لكل فئة لإنتاج مجموعة تدريب متوازنة عبر الفئات السبع جميعها."
    },
    {
      "key": "results",
      "title": "النتائج والتقييم",
      "lead": "يبلغ المُصنِّف دقة إجمالية قدرها 95% عبر فئات الأمراض السبع.",
      "paragraphs": [
        "تحقّق الشبكة العصبية دقة إجمالية قدرها 95% عبر فئات الأمراض السبع. ويعرض الجدول أدناه الدقة (precision) والاستدعاء (recall) ومقياس F1 والدعم (support) — أي عدد العيّنات في كل فئة — على مجموعة البيانات المُعنونة الكاملة البالغة 4,822 عيّنة. وقد طُبِّقت موازنة الفئات عبر تقليل العيّنات على مجموعة التدريب، بينما تُحتسب هذه المقاييس على البيانات المُعنونة الأصلية."
      ],
      "table": {
        "caption": "مقاييس التصنيف لكل فئة على مجموعة الاختبار (الدقة الإجمالية: 95%).",
        "headers": [
          "الفئة",
          "المرض",
          "الدقة (Precision)",
          "الاستدعاء (Recall)",
          "مقياس F1",
          "الدعم (Support)"
        ],
        "rows": [
          [
            "1",
            "التهاب الجهاز التنفسي العلوي (Upper Respiratory Tract Infection)",
            "0.93",
            "0.97",
            "0.95",
            "1734"
          ],
          [
            "2",
            "التهاب الجلد (Dermatitis)",
            "0.99",
            "0.99",
            "0.99",
            "1400"
          ],
          [
            "3",
            "التهاب المعدة (Gastritis)",
            "0.96",
            "0.93",
            "0.95",
            "547"
          ],
          [
            "4",
            "التهاب الأنف (Rhinitis)",
            "0.94",
            "0.87",
            "0.90",
            "519"
          ],
          [
            "5",
            "التهاب الكبد الفيروسي (Viral Hepatitis)",
            "0.99",
            "0.99",
            "0.99",
            "221"
          ],
          [
            "6",
            "التهاب الأمعاء (Enteritis)",
            "0.88",
            "0.92",
            "0.90",
            "249"
          ],
          [
            "7",
            "الالتهاب الرئوي (Pneumonia)",
            "0.83",
            "0.72",
            "0.77",
            "152"
          ]
        ]
      },
      "note": "المتوسط الكلي (Macro): 0.93 دقة / 0.91 استدعاء / 0.92 مقياس F1. المتوسط المرجّح (Weighted): 0.95 دقة / 0.95 استدعاء / 0.95 مقياس F1 (إجمالي الدعم 4,822). تؤدي معظم الفئات أداءً قويًا، إذ يبلغ التهاب الجلد والتهاب الكبد الفيروسي مقياس F1 قدره 0.99. والالتهاب الرئوي (الفئة 7) هو الفئة الأضعف، بمقياس F1 قدره 0.77، مدفوعًا أساسًا بانخفاض الاستدعاء (0.72) على عيّناته الـ152 الداعمة."
    },
    {
      "key": "stack",
      "title": "حزمة التقنيات",
      "lead": "الأدوات التي يقوم عليها SymptomsEase AI، من مسار الكلام دون اتصال إلى الشبكة العصبية وبنية سطح المكتب المعبّأة.",
      "bullets": [
        {
          "title": "Python 3.10",
          "desc": "اللغة الأساسية التي تربط التطبيق بأكمله معًا."
        },
        {
          "title": "Tkinter",
          "desc": "تبني واجهة سطح المكتب الرسومية وواجهة Midnight Violet الداكنة."
        },
        {
          "title": "PyAudio",
          "desc": "يلتقط صوت الميكروفون كتسجيلات أحادية بمعدل 16 كيلوهرتز."
        },
        {
          "title": "Vosk",
          "desc": "تحويل الكلام الإنجليزي إلى نص دون اتصال باستخدام نموذج vosk-model-small-en-us-0.15، دون الحاجة إلى الإنترنت."
        },
        {
          "title": "TensorFlow / Keras",
          "desc": "يشغّلان الشبكة العصبية Keras Sequential التي تصنّف الأعراض ضمن فئات الأمراض الـ7."
        },
        {
          "title": "scikit-learn",
          "desc": "يوفّر MinMaxScaler لقياس السمات قبل الاستدلال."
        },
        {
          "title": "NumPy",
          "desc": "يتعامل مع المصفوفات العددية ومتجهات سمات حقيبة الكلمات (Bag-of-Words)."
        },
        {
          "title": "Pillow",
          "desc": "يحمّل ويعرض صور الواجهة والأيقونات."
        },
        {
          "title": "PyInstaller",
          "desc": "يعبّئ التطبيق في ملف Windows .exe مستقل، بحيث لا يحتاج المستخدمون إلى تثبيت Python."
        }
      ]
    },
    {
      "key": "install",
      "title": "التثبيت والبدء",
      "lead": "يعمل تطبيق SymptomsEase AI بالكامل على جهاز كمبيوتر Windows الخاص بك. لا يوجد مثبِّت ولا حاجة إلى Python. نزّل، وفُك الضغط، وشغّل.",
      "steps": [
        {
          "title": "نزّل ملف ZIP",
          "desc": "نزّل حزمة SymptomsEase AI. تصل على هيئة أرشيف ZIP واحد يحتوي على مجلد \"SymptomsEaseAI\" الكامل."
        },
        {
          "title": "فُك الضغط إلى موقع قابل للكتابة",
          "desc": "فُك ضغط مجلد \"SymptomsEaseAI\" بالكامل إلى مكان يمكنك الكتابة فيه، مثل سطح المكتب أو مجلد المستندات. لا تفُك ضغطه داخل C:\\Program Files، لأن التطبيق يحفظ الجلسات بجانبه ويحتاج إلى صلاحية الكتابة."
        },
        {
          "title": "شغّل SymptomsEaseAI.exe",
          "desc": "افتح المجلد المُستخرَج وانقر نقرًا مزدوجًا على \"SymptomsEaseAI.exe\". لا يلزم أي تثبيت ولا Python؛ يبدأ التطبيق مباشرة."
        },
        {
          "title": "تجاوز شاشة Windows SmartScreen",
          "desc": "التطبيق غير موقّع رقميًا، لذا قد تعرض شاشة Windows SmartScreen رسالة \"تمت حماية الكمبيوتر بواسطة Windows\". انقر على \"مزيد من المعلومات\"، ثم \"التشغيل على أي حال\" لتشغيله. تظهر هذه الرسالة لأن الملف غير موقّع، وليس بسبب وجود مشكلة في التطبيق."
        },
        {
          "title": "ابدأ جلسة جديدة",
          "desc": "في التطبيق، انقر على \"جلسة جديدة\" للبدء. تحتفظ كل جلسة بتسجيلها ونصها معًا."
        },
        {
          "title": "سجّل أعراضك",
          "desc": "انقر على \"تسجيل\" وانطق بوصف قصير لأعراضك في الميكروفون، ثم انقر على \"إيقاف\". يفرّغ التطبيق كلامك نصيًا دون اتصال بالإنترنت تمامًا."
        },
        {
          "title": "حلّل النتائج",
          "desc": "انقر على \"تحليل\" لتشغيل التصنيف. يعرض التطبيق الحالتين الأكثر احتمالًا، كل منهما مع شريط ثقة. وتُحفظ الجلسات داخل مجلد التطبيق للرجوع إليها لاحقًا."
        }
      ],
      "note": "تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم، وليس جهازًا طبيًا معتمدًا. وهو للبحث والتعليم فقط ويجب ألا يُستخدم أبدًا للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا.",
      "ctaPrimary": "التنزيل لنظام Windows",
      "ctaSecondary": "متطلبات النظام"
    },
    {
      "key": "requirements",
      "title": "متطلبات الكمبيوتر",
      "lead": "يعمل تطبيق SymptomsEase AI بالكامل دون اتصال بالإنترنت على أجهزة كمبيوتر Windows العادية — لا يلزم اتصال بالإنترنت ولا تثبيت Python.",
      "bullets": [
        {
          "title": "نظام التشغيل",
          "desc": "Windows 10 أو 11، بمعمارية 64 بت."
        },
        {
          "title": "المعالج",
          "desc": "أي معالج x86-64 حديث يدعم AVX2 (أي تقريبًا جميع أجهزة الكمبيوتر منذ نحو عام 2014 فصاعدًا)؛ ويُوصى بمعالج Intel i5 أو ما يعادله."
        },
        {
          "title": "الذاكرة",
          "desc": "4 جيجابايت من ذاكرة الوصول العشوائي كحد أدنى، ويُوصى بـ8 جيجابايت."
        },
        {
          "title": "مساحة القرص",
          "desc": "نحو 2 جيجابايت متاحة للتطبيق بعد فك ضغطه."
        },
        {
          "title": "الميكروفون",
          "desc": "يلزم وجود ميكروفون يعمل فقط عند تسجيل الأعراض."
        },
        {
          "title": "الاتصال",
          "desc": "يعمل بالكامل دون اتصال — لا يلزم أي اتصال بالإنترنت لاستخدام التطبيق."
        }
      ]
    },
    {
      "key": "faq",
      "title": "الأسئلة الشائعة",
      "lead": "إجابات عن الأسئلة الشائعة حول كيفية عمل SymptomsEase AI، وما يمكنه فعله، وحدوده.",
      "bullets": [
        {
          "title": "هل هذا تشخيص طبي؟",
          "desc": "لا. تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم ومشروع تخرّج، وليس جهازًا طبيًا معتمدًا. وهو مخصّص للبحث والتعليم فقط ويجب ألا يُستخدم أبدًا للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا لأي قلق طبي."
        },
        {
          "title": "هل بياناتي خاصة، وهل يحتاج إلى اتصال بالإنترنت؟",
          "desc": "إنه يعمل بالكامل دون اتصال. فالتسجيل وتفريغ الكلام إلى نص والتصنيف جميعها تعمل محليًا على جهاز الكمبيوتر الخاص بك، ولذلك لا يلزم أي اتصال بالإنترنت ولا يغادر الصوت ولا النصوص جهازك أبدًا. وتُحفظ الجلسات (التسجيلات والنصوص) داخل مجلد التطبيق."
        },
        {
          "title": "ما اللغة التي يفهمها؟",
          "desc": "الإنجليزية فقط. يُفرّغ الكلام محليًا باستخدام نموذج Vosk \"vosk-model-small-en-us-0.15\" (الإنجليزية)، الذي يعمل بالكامل على جهازك دون أي وصول إلى الإنترنت."
        },
        {
          "title": "لماذا يحذّرني Windows عند فتحه؟",
          "desc": "لأن التطبيق غير موقّع رقميًا، قد تعرض شاشة Windows SmartScreen رسالة \"تمت حماية الكمبيوتر بواسطة Windows\" في المرة الأولى التي تشغّله فيها. انقر على \"مزيد من المعلومات\" ثم \"التشغيل على أي حال\" للمتابعة. وهذا أمر متوقّع لبنية أكاديمية غير موقّعة."
        },
        {
          "title": "ما الحالات التي يمكنه اكتشافها؟",
          "desc": "يصنّف الأعراض التي تصفها ضمن إحدى 7 فئات ويعرض الحالتين الأكثر احتمالًا مع نسب الثقة: التهاب الجهاز التنفسي العلوي، والتهاب الجلد، والتهاب المعدة، والتهاب الأنف، والتهاب الكبد الفيروسي، والتهاب الأمعاء، والالتهاب الرئوي. على مجموعة الاختبار، بلغت الدقة الإجمالية 95%، وإن كان الالتهاب الرئوي هو الفئة الأضعف (مقياس F1 قدره 0.77)."
        },
        {
          "title": "هل أحتاج إلى تثبيت Python أو أي شيء آخر؟",
          "desc": "لا. التطبيق معبّأ كملف Windows .exe قابل للتنزيل بكل ما يلزم مضمّنًا، ولذلك لا يلزم Python ولا أي تثبيت. ما عليك سوى فك ضغط مجلد \"SymptomsEaseAI\" إلى موقع قابل للكتابة (مثل سطح المكتب أو المستندات، وليس داخل C:\\Program Files) والنقر نقرًا مزدوجًا على \"SymptomsEaseAI.exe\". ويلزم وجود ميكروفون يعمل للتسجيل فقط."
        }
      ],
      "note": "تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم للبحث والتعليم فقط. وهو ليس جهازًا طبيًا معتمدًا ويجب ألا يُستخدم أبدًا للتشخيص الفعلي. استشر دائمًا طبيبًا مرخّصًا."
    },
    {
      "key": "disclaimer",
      "title": "إخلاء المسؤولية الطبية",
      "paragraphs": [
        "تطبيق SymptomsEase AI هو نموذج أكاديمي لإثبات المفهوم بُني كمشروع تخرّج جامعي؛ وهو ليس جهازًا طبيًا معتمدًا ومخصّص حصرًا لأغراض البحث والتعليم. وتنبّؤاته ما هي إلا تقديرات فحص أولية فقط ويجب ألا تُستخدم أبدًا للتشخيص الفعلي أو كبديل عن المشورة الطبية المتخصصة. استشر دائمًا طبيبًا مرخّصًا لأي قلق صحي أو تشخيص أو قرار علاجي."
      ],
      "note": "للبحث والتعليم فقط. ليس مخصّصًا للاستخدام السريري."
    },
    {
      "key": "download",
      "title": "تنزيل SymptomsEase AI",
      "lead": "احصل على تطبيق سطح المكتب لنظام Windows. لا يلزم أي تثبيت ولا Python، فهو يعمل بالكامل دون اتصال بالإنترنت.",
      "paragraphs": [
        "نزّل التطبيق كملف ZIP، ثم فُك ضغط مجلد SymptomsEaseAI بالكامل إلى موقع قابل للكتابة مثل سطح المكتب أو المستندات (وليس داخل C:\\Program Files). افتح المجلد وانقر نقرًا مزدوجًا على SymptomsEaseAI.exe للبدء."
      ],
      "ctaPrimary": "التنزيل لنظام Windows",
      "ctaSecondary": "عرض خطوات الإعداد",
      "note": "Windows 10/11، بمعمارية 64 بت. نحو 2 جيجابايت مساحة قرص متاحة للتطبيق بعد فك ضغطه. غير موقّع رقميًا، لذا قد تظهر شاشة SmartScreen: انقر على مزيد من المعلومات، ثم التشغيل على أي حال."
    }
  ],
  "order": [
    "hero",
    "overview",
    "features",
    "how",
    "model",
    "dataset",
    "results",
    "stack",
    "install",
    "requirements",
    "faq",
    "disclaimer",
    "download"
  ]
};
