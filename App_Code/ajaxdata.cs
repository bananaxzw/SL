using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

/// <summary>
///ajaxdata 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
//若要允许使用 ASP.NET AJAX 从脚本中调用此 Web 服务，请取消对下行的注释。 
[System.Web.Script.Services.ScriptService]
public class ajaxdata : System.Web.Services.WebService
{

    public ajaxdata()
    {

        //如果使用设计的组件，请取消注释以下行 
        //InitializeComponent(); 
    }

    [WebMethod]
    public List<valuetext> HelloWorld()
    {
        List<valuetext> l = new List<valuetext>();
        valuetext s = new valuetext() { text = "许志伟1", value = 1 };
        l.Add(s);
        valuetext s1 = new valuetext() { text = "许志伟2", value = 2 };
        l.Add(s1);
        valuetext s2 = new valuetext() { text = "许志伟3", value = 3 };
        l.Add(s2);
        return l;
    }
    public class valuetext
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
