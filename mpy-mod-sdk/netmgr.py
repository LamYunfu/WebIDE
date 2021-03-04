"""
netmgr
=====

Provides
  1. network manager
  2. network control and network status func


How to use the documentation
----------------------------
Documentation is available in two forms: docstrings provided
with the code, and a loose standing reference guide, available from
`the Python homepage <https://g.alicdn.com/HaaSAI/haascvDoc/0.0.4/library/netmgr.html>`_.

Examples:
The docstring examples assume that `netmgr` has been imported as `nm`::

  >>> import netmgr as  nm

init network and connect  it ::

  >>> nm.init()
  >>> nm.connect("ssid","password")



"""



def init():
    """
    init the platform network manager.

    Returns
    -------
    None

    
    Examples
    --------
    

    """
    pass

def connect(ssid,pwd):
    """
    connect the networkd with ssid and  pwd

    Parameters
    ----------
    ssid : 
        The ssid of wifi,type is str
    pwd : 
        the password of wifi,type is str
    

    Returns
    -------
    None

    
    Examples
    --------
    >>> nm.connect("KIDS","12345678")

    """
    pass

def disconnect():
    """
    disconnect current  network .

    Returns
    -------
    None

    
    Examples
    --------
    

    """
    pass


def getType():
    """
    get current  network type .

    Returns
    -------
    return the network type  is int value .
        0  : NETWORK_WIFI

        1  : NETWORK_CELLULAR

        2  : NETWORK_ETHERNET

        3  : NETWORK_UNKNOW

    
    Examples
    --------
    """
    pass


def getStatus():
    """
    get current  network state .

    Returns
    -------
    return the network state  is bool value .
        True  : connected

        False  : disconnected

    Examples
    --------
    """
    pass

