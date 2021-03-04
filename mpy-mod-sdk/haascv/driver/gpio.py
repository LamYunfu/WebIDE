"""
gpio
=====

Provides
  1. GPIO Control


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/Driver.GPIO.html>`_.

Examples:
The docstring examples assume that `gpio` has been imported ::

  >>> import haascv
  >>> from haascv import driver

demo ::

  >>> import haascv
  >>> from haascv import driver
  >>> gpioObj = driver.gpio();
  >>> gpioObj.open(35, mode, 0);
  >>> gpioObj.write(0);
  >>> gpioObj.write(1);
  >>> gpioObj.close();

"""



def open(info):
    """
    Open the GPIO module.

    Parameters
    ----------
    info :
        GPIOInfo_t config

    Returns
    -------
    None


    Examples
    --------
    >>> gpioObj.open(35, mode, 0);


    """
    pass

def close():
    """
    close the gpio module .

    Returns
    -------
    None


    Examples
    --------
    >>> gpioObj.close();


    """
    pass

def read():
    """
    Read the GPIO Value .

    Returns
    -------
    None


    Examples
    --------
    >>> gpioObj.read();


    """
    pass

def write(value):
    """
    Write the GPIO Value.

    Parameters
    ----------
    value :
        gpio value

    Returns
    -------
    None


    Examples
    --------
    >>> gpioObj.write(1);


    """
    pass

def toggle():
    """
    Trigger an output GPIO pin's output .

    Returns
    -------
    None


    Examples
    --------
    >>> gpioObj.toggle();


    """
    pass

