"""
ml
=====

Provides
  1. AI engine


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/ML.html>`_.

Examples:
The docstring examples assume that `ml` has been imported ::

  >>> import haascv
  >>> from haascv import ml

demo ::

  >>> import haascv
  >>> from haascv import ml
  >>> mlobj = ml();
  >>> mlobj.open(ml.ML_ENGINE_ODLA);
  >>> mlobj.setInputData("/data/odla/test4.bmp");
  >>> mlobj.loadNet("default");
  >>> mlobj.predict();
  >>> responses_value = bytearray(10)
  >>> mlobj.getPredictResponses(responses_value);
  >>> print(responses_value);
  >>> mlobj.unLoadNet();
  >>> mlobj.close();



"""



def open(MLEngineType_t):
    """
    open the ml module.

    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.open(ml.ML_ENGINE_ODLA);


    """
    pass

def config(key, secret, region_id, endpoint, url):
    """
    config http info(for ucloud AI)

    Parameters
    ----------
    key :
        OSS Access Key
    secret :
        OSS Access secret
    region_id :
        The region id
    endpoint :
        OSS endpoint
    url :
        for facebody compare AI model


    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.config(OSS_ACCESS_KEY, OSS_ACCESS_SECRET, OSS_ENDPOINT, OSS_BUCKET, ML_MYFACE_PATH);

    """
    pass

def setInputData(dataPath):
    """
    set input data(come frome HaasDataInput)

    Parameters
    ----------
    dataPath :
        The path of DataSource


    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.setInputData("/data/odla/test4.bmp");

    """
    pass

def loadNet(modePath):
    """
    Load AI mode object

    Parameters
    ----------
    modePath :
        The path of AI Mode


    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.loadNet("default");

    """
    pass

def predict():
    """
    Start AI Predict .

    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.predict();


    """
    pass

def getPredictResponses():
    """
    Get AI Predict Result .

    Returns
    -------
    return the Predict Responses Data.
        0  : successfully

        -1  : failed


    Examples
    --------
    >>> responses_value = bytearray(10)
    >>> mlobj.getPredictResponses(responses_value);
    >>> print(responses_value);

    """
    pass

def unLoadNet():
    """
    un load AI Predict mode obj .

    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.unLoadNet();


    """
    pass

def close():
    """
    close the ml module .

    Returns
    -------
    None


    Examples
    --------
    >>> mlobj.close();


    """
    pass

