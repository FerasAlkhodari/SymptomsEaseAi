import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from collections import Counter
from wordcloud import WordCloud

def load_and_prepare_data():
    # Load the data
    df = pd.read_csv('data/raw_data(in) (2).csv')
    return df

def plot_symptom_distribution(df):
    plt.figure(figsize=(15, 8))
    # Count the most common symptoms/keywords
    symptom_counts = Counter(' '.join(df['Original Dialog']).lower().split()).most_common(20)
    symptoms = [item[0] for item in symptom_counts]
    counts = [item[1] for item in symptom_counts]
    
    # Create bar plot
    plt.bar(symptoms, counts)
    plt.xticks(rotation=45, ha='right')
    plt.title('Top 20 Most Common Terms in Medical Dialogues')
    plt.xlabel('Terms')
    plt.ylabel('Frequency')
    plt.tight_layout()
    plt.savefig('plots/symptom_distribution.png')
    plt.close()

def plot_dialogue_length_distribution(df):
    plt.figure(figsize=(12, 6))
    # Calculate dialogue lengths
    dialogue_lengths = df['Original Dialog'].str.len()
    
    # Create histogram
    sns.histplot(dialogue_lengths, bins=50)
    plt.title('Distribution of Dialogue Lengths')
    plt.xlabel('Dialogue Length (characters)')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('plots/dialogue_length_distribution.png')
    plt.close()

def create_word_cloud(df):
    plt.figure(figsize=(15, 8))
    # Combine all text
    text = ' '.join(df['Original Dialog'])
    
    # Create and generate a word cloud image
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
    
    # Display the word cloud
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title('Word Cloud of Medical Dialogues')
    plt.tight_layout()
    plt.savefig('plots/wordcloud.png')
    plt.close()

def plot_response_patterns(df):
    plt.figure(figsize=(12, 6))
    # Analyze response patterns (e.g., doctor vs patient message lengths)
    df['is_doctor'] = df['Original Dialog'].str.contains('doctor', case=False)
    doctor_lengths = df[df['is_doctor']]['Original Dialog'].str.len()
    patient_lengths = df[~df['is_doctor']]['Original Dialog'].str.len()
    
    # Create box plot
    data = [doctor_lengths, patient_lengths]
    plt.boxplot(data, labels=['Doctor Messages', 'Patient Messages'])
    plt.title('Distribution of Message Lengths: Doctor vs Patient')
    plt.ylabel('Message Length (characters)')
    plt.tight_layout()
    plt.savefig('plots/response_patterns.png')
    plt.close()

def create_all_plots():
    # Create plots directory if it doesn't exist
    import os
    if not os.path.exists('plots'):
        os.makedirs('plots')
    
    # Load data
    df = load_and_prepare_data()
    
    # Generate all plots
    plot_symptom_distribution(df)
    plot_dialogue_length_distribution(df)
    create_word_cloud(df)
    plot_response_patterns(df)
    
    print("All plots have been generated and saved in the 'plots' directory!")

if __name__ == "__main__":
    create_all_plots()
