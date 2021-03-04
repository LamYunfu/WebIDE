
import _linkkit as _lk

    """
    _linkkit module is impleted by c in micropython engine 
    
    """

class LinkKit(object):
    def __init__(self, host_name, product_key, device_name, device_secret,product_secret=None, user_data=None):
        
        """
        init the linkkit sdk .

        Returns
        -------
        LinkKit Object

    
        Examples
        --------
    
          >>> lk = linkkit.LinkKit(host_name="cn-shanghai",
                product_key=PRODUCT_KEY,
                device_name=DEVICE_NAME,
                device_secret=DEVICE_SECRET,
                product_secret=PRODUCT_SECRET)

        """

        def __str_is_empty(value):
            if value is None or value == "":
                return True
            else:
                return False
        # param check
        if __str_is_empty(host_name):
            raise ValueError("host_name wrong")
        if __str_is_empty(product_key):
            raise ValueError("product key wrong")
        if __str_is_empty(device_name):
            raise ValueError("device name wrong")
        if __str_is_empty(device_secret) and __str_is_empty(product_secret):
            raise ValueError("device secret & product secret are both empty")
        

    #             # config internal property
        self.__host_name = host_name
        self.__product_key = product_key
        self.__device_name = device_name
        self.__device_secret = device_secret
        self.__product_secret = product_secret
        self.__on_device_dynamic_register = None
        self.__on_service_request = None
        self.__on_prop_set = None
    #     # mqtt callbacks
        self.__on_connect = None
        self.__on_disconnect = None
        self.__on_thing_prop_post = None
        self.__on_thing_event_post = None
        _lk.init(self.__host_name,self.__product_key,self.__device_name,self.__device_secret,self.__product_secret)
        

    def __register_callback(self):
        _lk.register_call_back(1,self.__on_connect)
        _lk.register_call_back(3,self.__on_disconnect)
        _lk.register_call_back(5,self.__on_service_request)
        _lk.register_call_back(7,self.__on_prop_set)
        _lk.register_call_back(9,self.__on_thing_prop_post)
        _lk.register_call_back(10,self.__on_thing_event_post)

    def connect_async(self):

        """
        connect linkkit  platform async.

        Returns
        -------
        None

    
        Examples
        --------
    

        """
        self.__register_callback()
        
        ret = _lk.register_dyn_dev()
        if(ret == True):
            print("register_dyn_dev success")
        else:
            print("register_dyn_dev failed")

        if self.__on_device_dynamic_register is None:
            pass
        else:
            try:
                self.__on_device_dynamic_register(0,"succeed",None)

            except Exception as e:
                print('callback on_device_dynamic_register failed ')
        _lk.connect()

    def thing_post_property(self, property_data):
        """
        set the property for thing

        Parameters
        ----------
        property_data : the json value to be set 

        Returns
        -------
        return the int value id of this post action

    
        Examples
        --------
            >>> property_test = {
                    "test_prop": 1
                }
            >>> payload = ujson.dumps(property_test)
            >>> request_id = lk.thing_post_property(payload)
    

        """
        return _lk.post_property(property_data)    

    def thing_trigger_event(self, event_tuple):
        """
        trigger the event  for thing

        Parameters
        ----------
        event_tuple : the tuple of the event data info

        Returns
        -------
        return the int value id of this trigger action

    
        Examples
        --------
            >>> event_test = {
                    "test_event": 2
                }
            >>> payload = ujson.dumps(event_test)
            >>> lk.thing_trigger_event(("EventTest",payload))
    

        """
        if isinstance(event_tuple, tuple):
            event, params = event_tuple
        return _lk.post_event(event,params)


    def do_yield(self,timeout):

        """
        set the reponse timeout value and trigger action to get wait for reponse

        Parameters
        ----------
        timeout : the timeout value for server reponse

        Returns
        -------
        None

    
        Examples
        --------

        """
        return _lk.do_yield(timeout)

    @property
    def on_device_dynamic_register(self):
        return self.__on_device_dynamic_register

    @on_device_dynamic_register.setter
    def on_device_dynamic_register(self, value):
        self.__on_device_dynamic_register = value

    @property
    def on_connect(self):
        return self.__on_connect

    @on_connect.setter
    def on_connect(self, value):
        """
        set linkkit on_connect callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_connect():
            >>>     print('linkkit connected')
            >>> lk.on_connect = on_connect
        """

        self.__on_connect = value
        

    @property
    def on_disconnect(self):
        return self.__on_disconnect

    @on_disconnect.setter
    def on_disconnect(self, value):
        """
        set linkkit on_disconnect callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_disconnect():
            >>>     print('linkkit disconnected')
            >>> lk.on_disconnect = on_disconnect
        """
        self.__on_disconnect = value

    @property
    def on_thing_call_service(self):
        return None

    @on_thing_call_service.setter
    def on_thing_call_service(self, value):
        """
        set linkkit on_thing_call_service callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
        """
        self.__on_thing_call_service = value

    @property
    def on_prop_set(self):
        return self.on_prop_set

    @on_prop_set.setter
    def on_prop_set(self, value):
        """
        set linkkit on_prop_set callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_prop_set(request):
            >>>     print("on_prop_set: request is %s  " %(request))
            >>> lk.on_prop_set  = on_prop_set
        """
        self.__on_prop_set = value

    @property
    def on_service_request(self):
        return self.__on_service_request

    @on_service_request.setter
    def on_service_request(self, value):
        """
        set linkkit on_service_request callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_service_request(request,response):
            >>>     print("on_service_request: request is %s ,response is %s " %(request,response))
            >>> lk.on_service_request = on_service_request
        """
        self.__on_service_request = value    

    @property
    def on_thing_event_post(self):
        return self.__on_thing_event_post

    @on_thing_event_post.setter
    def on_thing_event_post(self, value):
        """
        set linkkit on_thing_event_post callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_thing_event_post(id,code):
            >>>     print("on_trigger_event_reply: id is %d ,code is %d " %(id,code))
            >>> lk.on_thing_event_post = on_thing_event_post
        """
        self.__on_thing_event_post = value

    @property
    def on_thing_prop_post(self):
        return self.__on_thing_prop_post

    @on_thing_prop_post.setter
    def on_thing_prop_post(self, value):
        """
        set linkkit on_thing_prop_post callback function

        Parameters
        ----------
        value : the callback function

        Returns
        -------
        None

    
        Examples
        --------
            >>> def on_thing_prop_post(id,code):
            >>>     print(' on report reply: id is %d , code is %d  ' %(id,code))
            >>> lk.on_thing_prop_post = on_thing_prop_post
        """
        self.__on_thing_prop_post = value







