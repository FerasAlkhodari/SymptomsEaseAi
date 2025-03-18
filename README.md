# SymptomsEase AI Model

This repository contains the code and models for the SymptomsEase AI system, which can classify patient dialogs into different disease categories based on symptoms and conversation patterns.

## Project Overview

The SymptomsEase AI system is designed to analyze patient-doctor conversations and automatically classify them into one of seven disease categories. This can help healthcare providers quickly assess and triage patients based on their symptoms and complaints.

## Dataset

The model was trained on a dataset of patient-doctor dialogs, each labeled with a disease category (1-7). The original dataset had an imbalanced distribution of classes:

- Class 1: 1734 samples
- Class 2: 1400 samples
- Class 3: 547 samples
- Class 4: 519 samples
- Class 5: 221 samples
- Class 6: 249 samples
- Class 7: 152 samples

To address this imbalance, we performed undersampling to create a balanced dataset with 152 samples per class.

## Data Preprocessing

The text preprocessing pipeline included:

1. **Tokenization**: Using NLTK's RegexpTokenizer to extract words with 3 or more characters
2. **Lowercasing**: Converting all text to lowercase
3. **Stop Word Removal**: Eliminating common English words that don't contribute significant meaning
4. **Lemmatization**: Using WordNet lemmatizer to reduce words to their base form
5. **Bag of Words Representation**: Converting text to a numerical format using a sparse matrix representation

## Model Architecture

The model uses a neural network architecture with:

1. **Input Layer**: Matching the size of the feature vector (2730 features)
2. **Hidden Layers**: Multiple fully connected layers with ReLU activation
3. **Output Layer**: 7 neurons with softmax activation (for 7 disease categories)

The optimal model architecture was determined using Keras Tuner, which performed a random search to find the best combination of:
- Number of hidden layers (between 3-10 layers)
- Number of neurons per layer (between 4-128 neurons)

## Model Training

The training process included:

1. **Data Split**: Training (80%) and testing (20%) sets
2. **Feature Scaling**: Using MinMaxScaler to normalize the features
3. **Class Balancing**: Undersampling to create a balanced dataset
4. **Early Stopping**: To prevent overfitting, with a patience of 4 epochs
5. **Hyperparameter Tuning**: Using Keras Tuner to find the optimal model architecture

## Model Performance

The final model achieved impressive performance metrics on the test set:

```
              precision    recall  f1-score   support

           1       0.93      0.97      0.95      1734
           2       0.99      0.99      0.99      1400
           3       0.96      0.93      0.95       547
           4       0.94      0.87      0.90       519
           5       0.99      0.99      0.99       221
           6       0.88      0.92      0.90       249
           7       0.83      0.72      0.77       152

    accuracy                           0.95      4822
   macro avg       0.93      0.91      0.92      4822
weighted avg       0.95      0.95      0.95      4822
```

- Overall accuracy: 95%
- High precision and recall across all disease categories
- Slightly lower performance on category 7 (F1-score 0.77)

## Data Analysis Insights

1. **Data Imbalance**: The original dataset had significant class imbalance, with classes 1 and 2 being much more represented than others.
2. **Data Sparsity**: The feature matrix was very sparse, with only about 1.35% non-zero elements.
3. **Word Distribution**: Analysis of the most common words helped identify key terms related to each disease category.

## Repository Contents

- `Modified_EDA.ipynb`: Jupyter notebook containing the complete data analysis, preprocessing, and model development process
- `trained_model.h5`: The saved trained neural network model
- `scaler.pkl`: The fitted MinMaxScaler for feature normalization
- `features.pkl`: The list of features used in the model
- `visualization_plots.py`: Script for generating visualization plots
- `requirements_viz.txt`: Required Python packages for visualizations

## How to Use the Model

The model can be loaded and used to predict disease categories from new patient dialogs:

```python
import pickle
import numpy as np
from tensorflow.keras.models import load_model

# Load the trained model
model = load_model('trained_model.h5')

# Load the scaler and features
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
    
with open('features.pkl', 'rb') as f:
    features = pickle.load(f)

# Function to preprocess and predict
def predict_disease(patient_dialog):
    # Preprocess the dialog (tokenization, lemmatization, etc.)
    processed_tokens = dialog_to_processed_token_list(patient_dialog)
    
    # Convert to model input format
    input_vector = np.zeros(len(features))
    for token in processed_tokens:
        if token in features:
            input_vector[features.index(token)] = 1
    
    # Scale the features
    input_vector = scaler.transform([input_vector])[0]
    
    # Predict
    prediction = model.predict([input_vector])
    predicted_class = np.argmax(prediction) + 1
    
    return predicted_class
```

## Technical Implementation

1. **Libraries Used**:
   - TensorFlow/Keras for model building and training
   - NLTK for natural language processing
   - Scikit-learn for data splitting, scaling, and evaluation metrics
   - Pandas for data manipulation
   - Matplotlib and Seaborn for visualization

2. **Hardware Requirements**:
   - The model is lightweight and can run on standard hardware
   - Training can be accelerated with GPU but isn't necessary

3. **Model Selection**:
   - Neural networks were chosen for their ability to capture complex patterns in text data
   - Hyperparameter tuning helped optimize the model architecture

## Future Improvements

Potential enhancements for future versions:

1. **Advanced NLP Techniques**: Incorporating word embeddings (Word2Vec, GloVe) or transformer models (BERT)
2. **Data Augmentation**: Techniques to address class imbalance without losing data
3. **Multi-language Support**: Extending the model to work with languages other than English
4. **Explainability Features**: Adding tools to highlight which symptoms led to specific predictions
5. **Real-time Integration**: Developing APIs for integration with healthcare systems

## Conclusion

The SymptomsEase AI model demonstrates strong performance in classifying patient dialogs into disease categories. With an accuracy of 95%, it shows promising potential for assisting healthcare providers in quickly assessing patient conditions based on symptom descriptions. 
