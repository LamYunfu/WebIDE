"""
uart
=====

Provides
  1. UART Control


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/Driver.UART.html>`_.

Examples:
The docstring examples assume that `uart` has been imported ::

  >>> import haascv
  >>> from haascv import driver

demo ::

  >>> import haascv
  >>> from haascv import driver
  >>> uartObj.open(2, uartObj.DRIVER_HW_DATA_WIDTH_8BIT,
       115200, uartObj.DRIVER_HW_UART_1_STOP_BIT,
       uartObj.DRIVER_HW_FLOW_CONTROL_DISABLED,
       uartObj.DRIVER_HW_UART_NO_PARITY);
  >>> uart_read_buf = bytearray(4);
  >>> uart_write_buf = bytearray([97, 98, 99, 100]);
  >>> uartObj.write(uart_write_buf);
  >>> readSize = uartObj.read(uart_read_buf);
  >>> uartObj.close();

"""



def open(port, bitwidth, baudrate, stop_bits, flow_control, parity):
    """
    Open the uart module.

    Parameters
    ----------
    port :
        port
    bitwidth :
        bitwidth
    baudrate :
        baudrate
    stop_bits :
        stop bits
    flow_control :
        flow control
    parity :
        parity

    Returns
    -------
    None


    Examples
    --------
    >>> uartObj.open(2, uartObj.DRIVER_HW_DATA_WIDTH_8BIT,
        115200, uartObj.DRIVER_HW_UART_1_STOP_BIT,
        uartObj.DRIVER_HW_FLOW_CONTROL_DISABLED,
        uartObj.DRIVER_HW_UART_NO_PARITY);


    """
    pass

def close():
    """
    close the uart .

    Returns
    -------
    None


    Examples
    --------
    >>> uartObj.close();


    """
    pass

def read(uart_read_buf):
    """
    Read the GPIO Value .

    Parameters
    ----------
    uart_read_buf :
        read buf

    Returns
    -------
    None


    Examples
    --------
    >>> readSize = uartObj.read(uart_read_buf);


    """
    pass

def write(uart_write_buf):
    """
    Write the uart Value.

    Parameters
    ----------
    uart_write_buf :
        write value

    Returns
    -------
    None


    Examples
    --------
    >>> uartObj.write(uart_write_buf);


    """
    pass

