import pandas as pd
import math
import numpy as np

from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import LabelBinarizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import plot_roc_curve, roc_auc_score, roc_curve

import matplotlib.pyplot as plt
from matplotlib.lines import Line2D

#Common Model Algorithms
from sklearn import svm, tree, linear_model, neighbors, naive_bayes, ensemble, discriminant_analysis, gaussian_process
from xgboost import XGBClassifier

#Common Model Helpers
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn import feature_selection
from sklearn import model_selection
from sklearn import metrics

#Visualization
import matplotlib as mpl
import matplotlib.pyplot as plt
import matplotlib.pylab as pylab
import seaborn as sns
# from pandas.tools.plotting import scatter_matrix

df = pd.read_csv("corona_tested_individuals_ver_0083.english.csv")
df['gender'].fillna("other",inplace=True)
df['age_60_and_above'].fillna("unknown",inplace=True)
df.drop('test_date',axis=1,inplace=True)

label = LabelEncoder()
df['gender'] = label.fit_transform(df['gender'])
df['age_60_and_above'] = label.fit_transform(df['age_60_and_above'])
normal_index = df['corona_result'] != "other"
df = df[normal_index]
df['test_indication'] = label.fit_transform(df['test_indication'])
df['corona_result'] = label.fit_transform(df['corona_result'])

INPUT_FEATURES = ['cough', 'fever', 'sore_throat', 'shortness_of_breath', 'head_ache', 'age_60_and_above', 'gender', 'test_indication']
TARGET_COLUMN = 'corona_result'
train1_x, test1_x, train1_y, test1_y = model_selection.train_test_split(df[INPUT_FEATURES],df[TARGET_COLUMN],random_state=42)

print("Data1 Shape: {}".format(df.shape))
print("Train1 Shape: {}".format(train1_x.shape))
print("Test1 Shape: {}".format(test1_x.shape))

#Machine Learning Algorithm (MLA) Selection and Initialization
MLA = [
    #Ensemble Methods #all time consuming
    # ensemble.AdaBoostClassifier(),
    # ensemble.BaggingClassifier(),
    # ensemble.ExtraTreesClassifier(),
    # ensemble.GradientBoostingClassifier(),
    # ensemble.RandomForestClassifier(),

    #Gaussian Processes # large ram require
    # gaussian_process.GaussianProcessClassifier(),
    
    #GLM # have not try it before
    # linear_model.LogisticRegressionCV(),
    # linear_model.PassiveAggressiveClassifier(),
    # linear_model.RidgeClassifierCV(),
    # linear_model.SGDClassifier(),
    # linear_model.Perceptron(),
    
    # #Navies Bayes # fast
    # naive_bayes.BernoulliNB(),
    # naive_bayes.GaussianNB(),
    
    #Nearest Neighbor # slow
    # neighbors.KNeighborsClassifier(),
    
    #SVM
    # svm.SVC(probability=True),
    # svm.NuSVC(probability=True),
    # svm.LinearSVC(),
    
    #Trees    
    tree.DecisionTreeClassifier(),
    # tree.ExtraTreeClassifier(),
    
    # # #Discriminant Analysis
    # discriminant_analysis.LinearDiscriminantAnalysis(),
    # discriminant_analysis.QuadraticDiscriminantAnalysis(),

    
    # #xgboost: http://xgboost.readthedocs.io/en/latest/model.html
    # XGBClassifier()    
    ]

import pickle
cv_split = model_selection.ShuffleSplit(n_splits = 10, test_size = .3, train_size = .6, random_state = 42 )


#create table to compare MLA metrics
MLA_columns = ['MLA Name', 'MLA Parameters','MLA Train Accuracy Mean', 'MLA Test Accuracy Mean', 'MLA Test Accuracy 3*STD' ,'MLA Time']
MLA_columns = ['MLA Name', 'MLA Parameters','MLA Test Accuracy Mean', 'MLA Test Accuracy 3*STD' ,'MLA Time']

MLA_compare = pd.DataFrame(columns = MLA_columns)

#create table to compare MLA predictions
MLA_predict = df[TARGET_COLUMN]

#index through MLA and save performance to table
row_index = 0
for alg in MLA:

    #set name and parameters
    MLA_name   = alg.__class__.__name__
    # print(MLA_name)
    MLA_compare.loc[row_index, 'MLA Name'] = MLA_name
    MLA_compare.loc[row_index, 'MLA Parameters'] = str(alg.get_params())

    #data1[data1_x_bin] = df[INPUT_FEATURES]
    #data1[Target] = df[TARGET_COLUMN]
    #score model with cross validation: http://scikit-learn.org/stable/modules/generated/sklearn.model_selection.cross_validate.html#sklearn.model_selection.cross_validate
    cv_results = model_selection.cross_validate(alg, df[INPUT_FEATURES], df[TARGET_COLUMN], cv  = cv_split)
    print(f"{MLA_name}:{cv_results['test_score'].mean()}")
    MLA_compare.loc[row_index, 'MLA Time'] = cv_results['fit_time'].mean()
    # MLA_compare.loc[row_index, 'MLA Train Accuracy Mean'] = cv_results['train_score'].mean()
    MLA_compare.loc[row_index, 'MLA Test Accuracy Mean'] = cv_results['test_score'].mean()   
    #if this is a non-bias random sample, then +/-3 standard deviations (std) from the mean, should statistically capture 99.7% of the subsets
    MLA_compare.loc[row_index, 'MLA Test Accuracy 3*STD'] = cv_results['test_score'].std()*3   #let's know the worst that can happen!
    

    #save MLA predictions - see section 6 for usage
    alg.fit(df[INPUT_FEATURES], df[TARGET_COLUMN])
    pickle.dump(alg,open("DecesionTree.pth","wb"))
    MLA_predict[MLA_name] = alg.predict(df[INPUT_FEATURES])
    
    row_index+=1
