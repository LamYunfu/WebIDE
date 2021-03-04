# -*- coding: UTF-8 -*-

"""
i2c
=====

Provides
  1. I2C Control


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/Driver.I2C.html>`_.

Examples:
The docstring examples assume that `i2c` has been imported ::

  >>> import haascv
  >>> from haascv import driver

demo ::

  >>> import haascv
  >>> from haascv import driver
  >>> i2cObj = driver.i2c();
  >>> i2cObj.open(port, 8,  i2cObj.DRIVER_I2C_BIT_RATES_100K,i2cObj.DRIVER_I2C_MODE_MASTER, 0x70, 0)#配置i2c模块
  >>> i2c_read_buf = bytearray(6);
  >>> i2c_write_buf = bytearray([1, 2, 3, 4, 5, 6]);
  >>> i2cObj.write(i2c_write_buf);
  >>> i2cObj.read(i2c_read_buf);
  >>> i2cObj.close();

"""



def open(port, addr_width, freq, mode, addr, priv):
    """
    Open the I2C module.

    Parameters
    ----------
    port :
        port number
    addr_width :
        addr width
    freq :
        freq
    mode :
        mode
    addr :
        addr
    priv :
        priv

    Returns
    -------
    None


    Examples
    --------
    >>> i2cObj.open(port, 8,  i2cObj.DRIVER_I2C_BIT_RATES_100K,i2cObj.DRIVER_I2C_MODE_MASTER, 0x70, 0)


    """
    pass

def close():
    """
    close the i2c module .

    Returns
    -------
    None


    Examples
    --------
    >>> i2cObj.close();


    """
    pass

def read():
    """
    Read the i2c Value .

    Returns
    -------
    None


    Examples
    --------
    >>> i2c_read_buf = bytearray(6);
    >>> i2cObj.read(i2c_read_buf);



    """
    pass

def write(value):
    """
    Write the i2c Value.

    Parameters
    ----------
    value :
        i2c value

    Returns
    -------
    None


    Examples
    --------
    >>> i2c_write_buf = bytearray([1, 2, 3, 4, 5, 6]);
    >>> i2cObj.write(i2c_write_buf);


    """
    pass

