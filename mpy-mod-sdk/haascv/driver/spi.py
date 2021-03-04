"""
spi
=====

Provides
  1. spi Control


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/Driver.SPI.html>`_.

Examples:
The docstring examples assume that `spi` has been imported ::

  >>> import haascv
  >>> from haascv import driver

demo ::

  >>> import haascv
  >>> from haascv import driver
  >>> spiObj = driver.spi();
  >>> spiObj.open(0, spiObj.DRIVER_SPI_MODE_MASTER, 2000000, 0);
  >>> spi_read_buf = bytearray(4);
  >>> spi_write_buf = bytearray([0x01, 0x02, 0x10, 0xaa]);
  >>> spiObj.write(spi_write_buf);
  >>> spiObj.read(spi_read_buf);
  >>> print(spi_read_buf);

"""



def open(port, role_mode, freq, priv):
    """
    Open the GPIO module.

    Parameters
    ----------
    port :
        port
    role_mode :
        role mode
    freq :
        freq
    priv :
        priv

    Returns
    -------
    None


    Examples
    --------
    >>> spiObj.open(0, spiObj.DRIVER_SPI_MODE_MASTER, 2000000, 0);


    """
    pass

def close():
    """
    close the spi module .

    Returns
    -------
    None


    Examples
    --------
    >>> spiObj.close();


    """
    pass

def read(spi_read_buf):
    """
    Read the spi Value .

    Parameters
    ----------
    spi_read_buf :
        read buffer

    Returns
    -------
    None


    Examples
    --------
    >>> spi.read(spi_read_buf);


    """
    pass

def write(spi_write_buf):
    """
    Write the spi Value.

    Parameters
    ----------
    spi_write_buf :
        write buf

    Returns
    -------
    None


    Examples
    --------
    >>> spiObj.write(spi_write_buf);


    """
    pass

