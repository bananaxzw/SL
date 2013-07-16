<%@ WebHandler Language="C#" Class="ajaxdata" %>

using System;
using System.Web;

public class ajaxdata : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        System.Threading.Thread.Sleep(1000);
        context.Response.ContentType = "text/plain";
        System.Collections.Generic.List<valuetext> l = new System.Collections.Generic.List<valuetext>();
        valuetext s = new valuetext() { text = "许志伟1", value = 1 };
        l.Add(s);
        valuetext s1 = new valuetext() { text = "许志伟2", value = 2 };
        l.Add(s1);
        valuetext s2 = new valuetext() { text = "许志伟3", value = 3 };
        l.Add(s2);
        var sss = Newtonsoft.Json.JsonConvert.SerializeObject(l);
        context.Response.Write(sss);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }
    class valuetext
    {
        public string text
        {
            get;
            set;
        }
        public int value
        {
            get;
            set;
        }
    }

}