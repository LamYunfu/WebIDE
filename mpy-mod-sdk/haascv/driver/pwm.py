"""
pwm
=====

Provides
  1. pwm Control


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/Driver.PWM.html>`_.

Examples:
The docstring examples assume that `pwm` has been imported ::

  >>> import haascv
  >>> from haascv import driver

demo ::

  >>> import haascv
  >>> from haascv import driver
  >>> pwmObj = driver.pwm();
  >>> pwmObj.open(35, 0.2, 25, 0);
  >>> pwmObj.setFreq(3250000);
  >>> pwmObj.setDuty(0.5);
  >>> duty = pwmObj.getDuty();
  >>> freq = pwmObj.getFreq();
  >>> pwmObj.close();

"""



def open(info):
    """
    Open the PWM module.

    Parameters
    ----------
    info :
        PWMInfo_t config

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.open(35, 0.2, 25, 0);


    """
    pass

def close():
    """
    close the pwm module .

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.close();


    """
    pass

def enable():
    """
    enable the pwm module .

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.enable();


    """
    pass

def disable():
    """
    disable the pwm module .

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.disable();


    """
    pass

def setFreq(freq):
    """
    set pwm freq.

    Parameters
    ----------
    freq :
        freq value

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.setFreq(0.5);


    """
    pass

def setDuty(duty):
    """
    set pwm duty.

    Parameters
    ----------
    duty :
        duty value

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.setDuty(3250000);


    """
    pass

def getFreq():
    """
    get pwm freq .

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.getFreq();


    """
    pass

def getDuty():
    """
    get pwm duty .

    Returns
    -------
    None


    Examples
    --------
    >>> pwmObj.getDuty();


    """
    pass


