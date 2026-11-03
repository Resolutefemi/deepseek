// src/lib/environment.ts
import path from "path";
import fs from "fs-extra";
import minimist from "minimist";
import _ from "lodash";
import dotenv from "dotenv";
dotenv.config();
var cmdArgs = minimist(process.argv.slice(2));
var envVars = process.env;
var Environment = class {
  /** 命令行参数 */
  cmdArgs;
  /** 环境变量 */
  envVars;
  /** 环境名称 */
  env;
  /** 服务名称 */
  name;
  /** 服务地址 */
  host;
  /** 服务端口 */
  port;
  /** 包参数 */
  package;
  constructor(options = {}) {
    const { cmdArgs: cmdArgs2, envVars: envVars2, package: _package } = options;
    this.cmdArgs = cmdArgs2;
    this.envVars = envVars2;
    this.env = _.defaultTo(cmdArgs2.env || envVars2.SERVER_ENV, "dev");
    this.name = cmdArgs2.name || envVars2.SERVER_NAME || void 0;
    this.host = cmdArgs2.host || envVars2.SERVER_HOST || void 0;
    this.port = Number(cmdArgs2.port || envVars2.SERVER_PORT) ? Number(cmdArgs2.port || envVars2.SERVER_PORT) : void 0;
    this.package = _package;
  }
};
var environment_default = new Environment({
  cmdArgs,
  envVars,
  package: JSON.parse(fs.readFileSync(path.join(path.resolve(), "package.json")).toString())
});

// src/lib/configs/service-config.ts
import path3 from "path";
import fs3 from "fs-extra";
import yaml from "yaml";
import _3 from "lodash";

// src/lib/util.ts
import os from "os";
import path2 from "path";
import crypto from "crypto";
import { Readable, Writable } from "stream";
import "colors";
import mime from "mime";
import axios from "axios";
import fs2 from "fs-extra";
import { v1 as uuid } from "uuid";
import { format as dateFormat } from "date-fns";
import CRC32 from "crc-32";
import randomstring from "randomstring";
import _2 from "lodash";
import { CronJob } from "cron";

// src/lib/http-status-codes.ts
var http_status_codes_default = {
  CONTINUE: 100,
  //客户端应当继续发送请求。这个临时响应是用来通知客户端它的部分请求已经被服务器接收，且仍未被拒绝。客户端应当继续发送请求的剩余部分，或者如果请求已经完成，忽略这个响应。服务器必须在请求完成后向客户端发送一个最终响应
  SWITCHING_PROTOCOLS: 101,
  //服务器已经理解了客户端的请求，并将通过Upgrade 消息头通知客户端采用不同的协议来完成这个请求。在发送完这个响应最后的空行后，服务器将会切换到在Upgrade 消息头中定义的那些协议。只有在切换新的协议更有好处的时候才应该采取类似措施。例如，切换到新的HTTP 版本比旧版本更有优势，或者切换到一个实时且同步的协议以传送利用此类特性的资源
  PROCESSING: 102,
  //处理将被继续执行
  OK: 200,
  //请求已成功，请求所希望的响应头或数据体将随此响应返回
  CREATED: 201,
  //请求已经被实现，而且有一个新的资源已经依据请求的需要而建立，且其 URI 已经随Location 头信息返回。假如需要的资源无法及时建立的话，应当返回 '202 Accepted'
  ACCEPTED: 202,
  //服务器已接受请求，但尚未处理。正如它可能被拒绝一样，最终该请求可能会也可能不会被执行。在异步操作的场合下，没有比发送这个状态码更方便的做法了。返回202状态码的响应的目的是允许服务器接受其他过程的请求（例如某个每天只执行一次的基于批处理的操作），而不必让客户端一直保持与服务器的连接直到批处理操作全部完成。在接受请求处理并返回202状态码的响应应当在返回的实体中包含一些指示处理当前状态的信息，以及指向处理状态监视器或状态预测的指针，以便用户能够估计操作是否已经完成
  NON_AUTHORITATIVE_INFO: 203,
  //服务器已成功处理了请求，但返回的实体头部元信息不是在原始服务器上有效的确定集合，而是来自本地或者第三方的拷贝。当前的信息可能是原始版本的子集或者超集。例如，包含资源的元数据可能导致原始服务器知道元信息的超级。使用此状态码不是必须的，而且只有在响应不使用此状态码便会返回200 OK的情况下才是合适的
  NO_CONTENT: 204,
  //服务器成功处理了请求，但不需要返回任何实体内容，并且希望返回更新了的元信息。响应可能通过实体头部的形式，返回新的或更新后的元信息。如果存在这些头部信息，则应当与所请求的变量相呼应。如果客户端是浏览器的话，那么用户浏览器应保留发送了该请求的页面，而不产生任何文档视图上的变化，即使按照规范新的或更新后的元信息应当被应用到用户浏览器活动视图中的文档。由于204响应被禁止包含任何消息体，因此它始终以消息头后的第一个空行结尾
  RESET_CONTENT: 205,
  //服务器成功处理了请求，且没有返回任何内容。但是与204响应不同，返回此状态码的响应要求请求者重置文档视图。该响应主要是被用于接受用户输入后，立即重置表单，以便用户能够轻松地开始另一次输入。与204响应一样，该响应也被禁止包含任何消息体，且以消息头后的第一个空行结束
  PARTIAL_CONTENT: 206,
  //服务器已经成功处理了部分 GET 请求。类似于FlashGet或者迅雷这类的HTTP下载工具都是使用此类响应实现断点续传或者将一个大文档分解为多个下载段同时下载。该请求必须包含 Range 头信息来指示客户端希望得到的内容范围，并且可能包含 If-Range 来作为请求条件。响应必须包含如下的头部域：Content-Range 用以指示本次响应中返回的内容的范围；如果是Content-Type为multipart/byteranges的多段下载，则每一段multipart中都应包含Content-Range域用以指示本段的内容范围。假如响应中包含Content-Length，那么它的数值必须匹配它返回的内容范围的真实字节数。Date和ETag或Content-Location，假如同样的请求本应该返回200响应。Expires, Cache-Control，和/或 Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了 If-Range 强缓存验证，那么本次响应不应该包含其他实体头；假如本响应的请求使用了 If-Range 弱缓存验证，那么本次响应禁止包含其他实体头；这避免了缓存的实体内容和更新了的实体头信息之间的不一致。否则，本响应就应当包含所有本应该返回200响应中应当返回的所有实体头部域。假如 ETag 或 Latest-Modified 头部不能精确匹配的话，则客户端缓存应禁止将206响应返回的内容与之前任何缓存过的内容组合在一起。任何不支持 Range 以及 Content-Range 头的缓存都禁止缓存206响应返回的内容
  MULTIPLE_STATUS: 207,
  //代表之后的消息体将是一个XML消息，并且可能依照之前子请求数量的不同，包含一系列独立的响应代码
  MULTIPLE_CHOICES: 300,
  //被请求的资源有一系列可供选择的回馈信息，每个都有自己特定的地址和浏览器驱动的商议信息。用户或浏览器能够自行选择一个首选的地址进行重定向。除非这是一个HEAD请求，否则该响应应当包括一个资源特性及地址的列表的实体，以便用户或浏览器从中选择最合适的重定向地址。这个实体的格式由Content-Type定义的格式所决定。浏览器可能根据响应的格式以及浏览器自身能力，自动作出最合适的选择。当然，RFC 2616规范并没有规定这样的自动选择该如何进行。如果服务器本身已经有了首选的回馈选择，那么在Location中应当指明这个回馈的 URI；浏览器可能会将这个 Location 值作为自动重定向的地址。此外，除非额外指定，否则这个响应也是可缓存的
  MOVED_PERMANENTLY: 301,
  //被请求的资源已永久移动到新位置，并且将来任何对此资源的引用都应该使用本响应返回的若干个URI之一。如果可能，拥有链接编辑功能的客户端应当自动把请求的地址修改为从服务器反馈回来的地址。除非额外指定，否则这个响应也是可缓存的。新的永久性的URI应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，因此浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：对于某些使用 HTTP/1.0 协议的浏览器，当它们发送的POST请求得到了一个301响应的话，接下来的重定向请求将会变成GET方式
  FOUND: 302,
  //请求的资源现在临时从不同的URI响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI应当在响应的 Location 域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化。注意：虽然RFC 1945和RFC 2068规范不允许客户端在重定向时改变请求的方法，但是很多现存的浏览器将302响应视作为303响应，并且使用GET方式访问在Location中规定的URI，而无视原先请求的方法。状态码303和307被添加了进来，用以明确服务器期待客户端进行何种反应
  SEE_OTHER: 303,
  //对应当前请求的响应可以在另一个URI上被找到，而且客户端应当采用 GET 的方式访问那个资源。这个方法的存在主要是为了允许由脚本激活的POST请求输出重定向到一个新的资源。这个新的 URI 不是原始资源的替代引用。同时，303响应禁止被缓存。当然，第二个请求（重定向）可能被缓存。新的 URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI的超链接及简短说明。注意：许多 HTTP/1.1 版以前的浏览器不能正确理解303状态。如果需要考虑与这些浏览器之间的互动，302状态码应该可以胜任，因为大多数的浏览器处理302响应时的方式恰恰就是上述规范要求客户端处理303响应时应当做的
  NOT_MODIFIED: 304,
  //如果客户端发送了一个带条件的GET请求且该请求已被允许，而文档的内容（自上次访问以来或者根据请求的条件）并没有改变，则服务器应当返回这个状态码。304响应禁止包含消息体，因此始终以消息头后的第一个空行结尾。该响应必须包含以下的头信息：Date，除非这个服务器没有时钟。假如没有时钟的服务器也遵守这些规则，那么代理服务器以及客户端可以自行将Date字段添加到接收到的响应头中去（正如RFC 2068中规定的一样），缓存机制将会正常工作。ETag或 Content-Location，假如同样的请求本应返回200响应。Expires, Cache-Control，和/或Vary，假如其值可能与之前相同变量的其他响应对应的值不同的话。假如本响应请求使用了强缓存验证，那么本次响应不应该包含其他实体头；否则（例如，某个带条件的 GET 请求使用了弱缓存验证），本次响应禁止包含其他实体头；这避免了缓存了的实体内容和更新了的实体头信息之间的不一致。假如某个304响应指明了当前某个实体没有缓存，那么缓存系统必须忽视这个响应，并且重复发送不包含限制条件的请求。假如接收到一个要求更新某个缓存条目的304响应，那么缓存系统必须更新整个条目以反映所有在响应中被更新的字段的值
  USE_PROXY: 305,
  //被请求的资源必须通过指定的代理才能被访问。Location域中将给出指定的代理所在的URI信息，接收者需要重复发送一个单独的请求，通过这个代理才能访问相应资源。只有原始服务器才能建立305响应。注意：RFC 2068中没有明确305响应是为了重定向一个单独的请求，而且只能被原始服务器建立。忽视这些限制可能导致严重的安全后果
  UNUSED: 306,
  //在最新版的规范中，306状态码已经不再被使用
  TEMPORARY_REDIRECT: 307,
  //请求的资源现在临时从不同的URI 响应请求。由于这样的重定向是临时的，客户端应当继续向原有地址发送以后的请求。只有在Cache-Control或Expires中进行了指定的情况下，这个响应才是可缓存的。新的临时性的URI 应当在响应的Location域中返回。除非这是一个HEAD请求，否则响应的实体中应当包含指向新的URI 的超链接及简短说明。因为部分浏览器不能识别307响应，因此需要添加上述必要信息以便用户能够理解并向新的 URI 发出访问请求。如果这不是一个GET或者HEAD请求，那么浏览器禁止自动进行重定向，除非得到用户的确认，因为请求的条件可能因此发生变化
  BAD_REQUEST: 400,
  //1.语义有误，当前请求无法被服务器理解。除非进行修改，否则客户端不应该重复提交这个请求 2.请求参数有误
  UNAUTHORIZED: 401,
  //当前请求需要用户验证。该响应必须包含一个适用于被请求资源的 WWW-Authenticate 信息头用以询问用户信息。客户端可以重复提交一个包含恰当的 Authorization 头信息的请求。如果当前请求已经包含了 Authorization 证书，那么401响应代表着服务器验证已经拒绝了那些证书。如果401响应包含了与前一个响应相同的身份验证询问，且浏览器已经至少尝试了一次验证，那么浏览器应当向用户展示响应中包含的实体信息，因为这个实体信息中可能包含了相关诊断信息。参见RFC 2617
  PAYMENT_REQUIRED: 402,
  //该状态码是为了将来可能的需求而预留的
  FORBIDDEN: 403,
  //服务器已经理解请求，但是拒绝执行它。与401响应不同的是，身份验证并不能提供任何帮助，而且这个请求也不应该被重复提交。如果这不是一个HEAD请求，而且服务器希望能够讲清楚为何请求不能被执行，那么就应该在实体内描述拒绝的原因。当然服务器也可以返回一个404响应，假如它不希望让客户端获得任何信息
  NOT_FOUND: 404,
  //请求失败，请求所希望得到的资源未被在服务器上发现。没有信息能够告诉用户这个状况到底是暂时的还是永久的。假如服务器知道情况的话，应当使用410状态码来告知旧资源因为某些内部的配置机制问题，已经永久的不可用，而且没有任何可以跳转的地址。404这个状态码被广泛应用于当服务器不想揭示到底为何请求被拒绝或者没有其他适合的响应可用的情况下
  METHOD_NOT_ALLOWED: 405,
  //请求行中指定的请求方法不能被用于请求相应的资源。该响应必须返回一个Allow 头信息用以表示出当前资源能够接受的请求方法的列表。鉴于PUT，DELETE方法会对服务器上的资源进行写操作，因而绝大部分的网页服务器都不支持或者在默认配置下不允许上述请求方法，对于此类请求均会返回405错误
  NO_ACCEPTABLE: 406,
  //请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体。除非这是一个 HEAD 请求，否则该响应就应当返回一个包含可以让用户或者浏览器从中选择最合适的实体特性以及地址列表的实体。实体的格式由Content-Type头中定义的媒体类型决定。浏览器可以根据格式及自身能力自行作出最佳选择。但是，规范中并没有定义任何作出此类自动选择的标准
  PROXY_AUTHENTICATION_REQUIRED: 407,
  //与401响应类似，只不过客户端必须在代理服务器上进行身份验证。代理服务器必须返回一个Proxy-Authenticate用以进行身份询问。客户端可以返回一个Proxy-Authorization信息头用以验证。参见RFC 2617
  REQUEST_TIMEOUT: 408,
  //请求超时。客户端没有在服务器预备等待的时间内完成一个请求的发送。客户端可以随时再次提交这一请求而无需进行任何更改
  CONFLICT: 409,
  //由于和被请求的资源的当前状态之间存在冲突，请求无法完成。这个代码只允许用在这样的情况下才能被使用：用户被认为能够解决冲突，并且会重新提交新的请求。该响应应当包含足够的信息以便用户发现冲突的源头。冲突通常发生于对PUT请求的处理中。例如，在采用版本检查的环境下，某次PUT提交的对特定资源的修改请求所附带的版本信息与之前的某个（第三方）请求向冲突，那么此时服务器就应该返回一个409错误，告知用户请求无法完成。此时，响应实体中很可能会包含两个冲突版本之间的差异比较，以便用户重新提交归并以后的新版本
  GONE: 410,
  //被请求的资源在服务器上已经不再可用，而且没有任何已知的转发地址。这样的状况应当被认为是永久性的。如果可能，拥有链接编辑功能的客户端应当在获得用户许可后删除所有指向这个地址的引用。如果服务器不知道或者无法确定这个状况是否是永久的，那么就应该使用404状态码。除非额外说明，否则这个响应是可缓存的。410响应的目的主要是帮助网站管理员维护网站，通知用户该资源已经不再可用，并且服务器拥有者希望所有指向这个资源的远端连接也被删除。这类事件在限时、增值服务中很普遍。同样，410响应也被用于通知客户端在当前服务器站点上，原本属于某个个人的资源已经不再可用。当然，是否需要把所有永久不可用的资源标记为'410 Gone'，以及是否需要保持此标记多长时间，完全取决于服务器拥有者
  LENGTH_REQUIRED: 411,
  //服务器拒绝在没有定义Content-Length头的情况下接受请求。在添加了表明请求消息体长度的有效Content-Length头之后，客户端可以再次提交该请求 
  PRECONDITION_FAILED: 412,
  //服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个。这个状态码允许客户端在获取资源时在请求的元信息（请求头字段数据）中设置先决条件，以此避免该请求方法被应用到其希望的内容以外的资源上
  REQUEST_ENTITY_TOO_LARGE: 413,
  //服务器拒绝处理当前请求，因为该请求提交的实体数据大小超过了服务器愿意或者能够处理的范围。此种情况下，服务器可以关闭连接以免客户端继续发送此请求。如果这个状况是临时的，服务器应当返回一个 Retry-After 的响应头，以告知客户端可以在多少时间以后重新尝试
  REQUEST_URI_TOO_LONG: 414,
  //请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。这比较少见，通常的情况包括：本应使用POST方法的表单提交变成了GET方法，导致查询字符串（Query String）过长。重定向URI “黑洞”，例如每次重定向把旧的URI作为新的URI的一部分，导致在若干次重定向后URI超长。客户端正在尝试利用某些服务器中存在的安全漏洞攻击服务器。这类服务器使用固定长度的缓冲读取或操作请求的URI，当GET后的参数超过某个数值后，可能会产生缓冲区溢出，导致任意代码被执行[1]。没有此类漏洞的服务器，应当返回414状态码
  UNSUPPORTED_MEDIA_TYPE: 415,
  //对于当前请求的方法和所请求的资源，请求中提交的实体并不是服务器中所支持的格式，因此请求被拒绝
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  //如果请求中包含了Range请求头，并且Range中指定的任何数据范围都与当前资源的可用范围不重合，同时请求中又没有定义If-Range请求头，那么服务器就应当返回416状态码。假如Range使用的是字节范围，那么这种情况就是指请求指定的所有数据范围的首字节位置都超过了当前资源的长度。服务器也应当在返回416状态码的同时，包含一个Content-Range实体头，用以指明当前资源的长度。这个响应也被禁止使用multipart/byteranges作为其 Content-Type
  EXPECTION_FAILED: 417,
  //在请求头Expect中指定的预期内容无法被服务器满足，或者这个服务器是一个代理服务器，它有明显的证据证明在当前路由的下一个节点上，Expect的内容无法被满足
  TOO_MANY_CONNECTIONS: 421,
  //从当前客户端所在的IP地址到服务器的连接数超过了服务器许可的最大范围。通常，这里的IP地址指的是从服务器上看到的客户端地址（比如用户的网关或者代理服务器地址）。在这种情况下，连接数的计算可能涉及到不止一个终端用户
  UNPROCESSABLE_ENTITY: 422,
  //请求格式正确，但是由于含有语义错误，无法响应
  FAILED_DEPENDENCY: 424,
  //由于之前的某个请求发生的错误，导致当前请求失败，例如PROPPATCH
  UNORDERED_COLLECTION: 425,
  //在WebDav Advanced Collections 草案中定义，但是未出现在《WebDAV 顺序集协议》（RFC 3658）中
  UPGRADE_REQUIRED: 426,
  //客户端应当切换到TLS/1.0
  RETRY_WITH: 449,
  //由微软扩展，代表请求应当在执行完适当的操作后进行重试
  INTERNAL_SERVER_ERROR: 500,
  //服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。一般来说，这个问题都会在服务器的程序码出错时出现
  NOT_IMPLEMENTED: 501,
  //服务器不支持当前请求所需要的某个功能。当服务器无法识别请求的方法，并且无法支持其对任何资源的请求
  BAD_GATEWAY: 502,
  //作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应
  SERVICE_UNAVAILABLE: 503,
  //由于临时的服务器维护或者过载，服务器当前无法处理请求。这个状况是临时的，并且将在一段时间以后恢复。如果能够预计延迟时间，那么响应中可以包含一个 Retry-After 头用以标明这个延迟时间。如果没有给出这个 Retry-After 信息，那么客户端应当以处理500响应的方式处理它。注意：503状态码的存在并不意味着服务器在过载的时候必须使用它。某些服务器只不过是希望拒绝客户端的连接
  GATEWAY_TIMEOUT: 504,
  //作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI标识出的服务器，例如HTTP、FTP、LDAP）或者辅助服务器（例如DNS）收到响应。注意：某些代理服务器在DNS查询超时时会返回400或者500错误
  HTTP_VERSION_NOT_SUPPORTED: 505,
  //服务器不支持，或者拒绝支持在请求中使用的HTTP版本。这暗示着服务器不能或不愿使用与客户端相同的版本。响应中应当包含一个描述了为何版本不被支持以及服务器支持哪些协议的实体
  VARIANT_ALSO_NEGOTIATES: 506,
  //服务器存在内部配置错误：被请求的协商变元资源被配置为在透明内容协商中使用自己，因此在一个协商处理中不是一个合适的重点
  INSUFFICIENT_STORAGE: 507,
  //服务器无法存储完成请求所必须的内容。这个状况被认为是临时的
  BANDWIDTH_LIMIT_EXCEEDED: 509,
  //服务器达到带宽限制。这不是一个官方的状态码，但是仍被广泛使用
  NOT_EXTENDED: 510
  //获取资源所需要的策略并没有没满足
};

// src/lib/util.ts
var autoIdMap = /* @__PURE__ */ new Map();
var util = {
  is2DArrays(value) {
    return _2.isArray(value) && (!value[0] || _2.isArray(value[0]) && _2.isArray(value[value.length - 1]));
  },
  uuid: (separator = true) => separator ? uuid() : uuid().replace(/\-/g, ""),
  autoId: (prefix = "") => {
    let index = autoIdMap.get(prefix);
    if (index > 999999) index = 0;
    autoIdMap.set(prefix, (index || 0) + 1);
    return `${prefix}${index || 1}`;
  },
  ignoreJSONParse(value) {
    const result = _2.attempt(() => JSON.parse(value));
    if (_2.isError(result)) return null;
    return result;
  },
  generateRandomString(options) {
    return randomstring.generate(options);
  },
  getResponseContentType(value) {
    return value.headers ? value.headers["content-type"] || value.headers["Content-Type"] : null;
  },
  mimeToExtension(value) {
    let extension = mime.getExtension(value);
    if (extension == "mpga") return "mp3";
    return extension;
  },
  extractURLExtension(value) {
    const extname = path2.extname(new URL(value).pathname);
    return extname.substring(1).toLowerCase();
  },
  createCronJob(cronPatterns, callback) {
    if (!_2.isFunction(callback))
      throw new Error("callback must be an Function");
    return new CronJob(
      cronPatterns,
      () => callback(),
      null,
      false,
      "Asia/Shanghai"
    );
  },
  getDateString(format = "yyyy-MM-dd", date = /* @__PURE__ */ new Date()) {
    return dateFormat(date, format);
  },
  getIPAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].address) addresses.push(results[0].address);
    }
    return addresses;
  },
  getMACAddressesByIPv4() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (let name in interfaces) {
      const networks = interfaces[name];
      const results = networks.filter(
        (network) => network.family === "IPv4" && network.address !== "127.0.0.1" && !network.internal
      );
      if (results[0] && results[0].mac) addresses.push(results[0].mac);
    }
    return addresses;
  },
  generateSSEData(event, data, retry) {
    return `event: ${event || "message"}
data: ${(data || "").replace(/\n/g, "\\n").replace(/\s/g, "\\s")}
retry: ${retry || 3e3}

`;
  },
  buildDataBASE64(type, ext, buffer) {
    return `data:${type}/${ext.replace("jpg", "jpeg")};base64,${buffer.toString(
      "base64"
    )}`;
  },
  isLinux() {
    return os.platform() !== "win32";
  },
  isIPAddress(value) {
    return _2.isString(value) && (/^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(
      value
    ) || /\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*/.test(
      value
    ));
  },
  isPort(value) {
    return _2.isNumber(value) && value > 0 && value < 65536;
  },
  isReadStream(value) {
    return value && (value instanceof Readable || "readable" in value || value.readable);
  },
  isWriteStream(value) {
    return value && (value instanceof Writable || "writable" in value || value.writable);
  },
  isHttpStatusCode(value) {
    return _2.isNumber(value) && Object.values(http_status_codes_default).includes(value);
  },
  isURL(value) {
    return !_2.isUndefined(value) && /^(http|https)/.test(value);
  },
  isSrc(value) {
    return !_2.isUndefined(value) && /^\/.+\.[0-9a-zA-Z]+(\?.+)?$/.test(value);
  },
  isBASE64(value) {
    return !_2.isUndefined(value) && /^[a-zA-Z0-9\/\+]+(=?)+$/.test(value);
  },
  isBASE64Data(value) {
    return /^data:/.test(value);
  },
  extractBASE64DataFormat(value) {
    const match = value.trim().match(/^data:(.+);base64,/);
    if (!match) return null;
    return match[1];
  },
  removeBASE64DataHeader(value) {
    return value.replace(/^data:(.+);base64,/, "");
  },
  isDataString(value) {
    return /^(base64|json):/.test(value);
  },
  isStringNumber(value) {
    return _2.isFinite(Number(value));
  },
  isUnixTimestamp(value) {
    return /^[0-9]{10}$/.test(`${value}`);
  },
  isTimestamp(value) {
    return /^[0-9]{13}$/.test(`${value}`);
  },
  isEmail(value) {
    return /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(
      value
    );
  },
  isAsyncFunction(value) {
    return Object.prototype.toString.call(value) === "[object AsyncFunction]";
  },
  async isAPNG(filePath) {
    let head;
    const readStream = fs2.createReadStream(filePath, { start: 37, end: 40 });
    const readPromise = new Promise((resolve, reject) => {
      readStream.once("end", resolve);
      readStream.once("error", reject);
    });
    readStream.once("data", (data) => head = data);
    await readPromise;
    return head.compare(Buffer.from([97, 99, 84, 76])) === 0;
  },
  unixTimestamp() {
    return parseInt(`${Date.now() / 1e3}`);
  },
  timestamp() {
    return Date.now();
  },
  urlJoin(...values) {
    let url = "";
    for (let i = 0; i < values.length; i++)
      url += `${i > 0 ? "/" : ""}${values[i].replace(/^\/*/, "").replace(/\/*$/, "")}`;
    return url;
  },
  millisecondsToHmss(milliseconds) {
    if (_2.isString(milliseconds)) return milliseconds;
    milliseconds = parseInt(milliseconds);
    const sec = Math.floor(milliseconds / 1e3);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec - hours * 3600) / 60);
    const seconds = sec - hours * 3600 - minutes * 60;
    const ms = milliseconds % 6e4 - seconds * 1e3;
    return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}.${ms}`;
  },
  millisecondsToTimeString(milliseconds) {
    if (milliseconds < 1e3) return `${milliseconds}ms`;
    if (milliseconds < 6e4)
      return `${parseFloat((milliseconds / 1e3).toFixed(2))}s`;
    return `${Math.floor(milliseconds / 1e3 / 60)}m${Math.floor(
      milliseconds / 1e3 % 60
    )}s`;
  },
  rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  hexToRgb(hex) {
    const value = parseInt(hex.replace(/^#/, ""), 16);
    return [value >> 16 & 255, value >> 8 & 255, value & 255];
  },
  md5(value) {
    return crypto.createHash("md5").update(value).digest("hex");
  },
  crc32(value) {
    return _2.isBuffer(value) ? CRC32.buf(value) : CRC32.str(value);
  },
  arrayParse(value) {
    return _2.isArray(value) ? value : [value];
  },
  booleanParse(value) {
    return value === "true" || value === true ? true : false;
  },
  encodeBASE64(value) {
    return Buffer.from(value).toString("base64");
  },
  decodeBASE64(value) {
    return Buffer.from(value, "base64").toString();
  },
  async fetchFileBASE64(url) {
    const result = await axios.get(url, {
      responseType: "arraybuffer"
    });
    return result.data.toString("base64");
  },
  decodeXmlText(text) {
    if (!text) return "";
    return text.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#10;/g, "\n").replace(/&#13;/g, "\r");
  },
  findJsonEnd(text, startIndex) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];
      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === '"') inString = false;
        continue;
      }
      if (char === '"') {
        inString = true;
        continue;
      }
      if (char === "{") depth++;
      if (char === "}") {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    return -1;
  },
  parseToolInput(input) {
    if (!input) return {};
    const trimmed = input.trim();
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      try {
        const cleaned = trimmed.replace(/[\x00-\x1F\x7F-\x9F]/g, (c) => {
          if (c === "\n") return "\\n";
          if (c === "\r") return "\\r";
          if (c === "	") return "\\t";
          return `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
        });
        return JSON.parse(cleaned);
      } catch (e2) {
        const singleStringField = trimmed.match(/^\s*\{\s*"([^"\\]+)"\s*:\s*"([\s\S]*)"\s*\}\s*$/);
        if (singleStringField) {
          return { [singleStringField[1]]: singleStringField[2] };
        }
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
          return { input: trimmed };
        }
        return {};
      }
    }
  },
  isInsideMarkdownFence(text, index) {
    const before = text.slice(0, index);
    const fences = before.match(/^\s*```/gm);
    return Boolean(fences && fences.length % 2 === 1);
  }
};
var util_default = util;

// src/lib/configs/service-config.ts
var CONFIG_PATH = path3.join(path3.resolve(), "configs/", environment_default.env, "/service.yml");
var ServiceConfig = class _ServiceConfig {
  /** 服务名称 */
  name;
  /** @type {string} 服务绑定主机地址 */
  host;
  /** @type {number} 服务绑定端口 */
  port;
  /** @type {string} 服务路由前缀 */
  urlPrefix;
  /** @type {string} 服务绑定地址（外部访问地址） */
  bindAddress;
  constructor(options) {
    const { name, host, port, urlPrefix, bindAddress } = options || {};
    this.name = _3.defaultTo(name, "deepseek-free-api");
    this.host = _3.defaultTo(host, "0.0.0.0");
    this.port = _3.defaultTo(port, 5566);
    this.urlPrefix = _3.defaultTo(urlPrefix, "");
    this.bindAddress = bindAddress;
  }
  get addressHost() {
    if (this.bindAddress) return this.bindAddress;
    const ipAddresses = util_default.getIPAddressesByIPv4();
    for (let ipAddress2 of ipAddresses) {
      if (ipAddress2 === this.host)
        return ipAddress2;
    }
    return ipAddresses[0] || "127.0.0.1";
  }
  get address() {
    return `${this.addressHost}:${this.port}`;
  }
  get pageDirUrl() {
    return `http://127.0.0.1:${this.port}/page`;
  }
  get publicDirUrl() {
    return `http://127.0.0.1:${this.port}/public`;
  }
  static load() {
    const external = _3.pickBy(environment_default, (v, k) => ["name", "host", "port"].includes(k) && !_3.isUndefined(v));
    if (!fs3.pathExistsSync(CONFIG_PATH)) return new _ServiceConfig(external);
    const data = yaml.parse(fs3.readFileSync(CONFIG_PATH).toString());
    return new _ServiceConfig({ ...data, ...external });
  }
};
var service_config_default = ServiceConfig.load();

// src/lib/configs/system-config.ts
import path4 from "path";
import fs4 from "fs-extra";
import yaml2 from "yaml";
import _4 from "lodash";
var CONFIG_PATH2 = path4.join(path4.resolve(), "configs/", environment_default.env, "/system.yml");
var SystemConfig = class _SystemConfig {
  /** 是否开启请求日志 */
  requestLog;
  /** 临时目录路径 */
  tmpDir;
  /** 日志目录路径 */
  logDir;
  /** 日志写入间隔（毫秒） */
  logWriteInterval;
  /** 日志文件有效期（毫秒） */
  logFileExpires;
  /** 公共目录路径 */
  publicDir;
  /** 临时文件有效期（毫秒） */
  tmpFileExpires;
  /** 请求体配置 */
  requestBody;
  /** 是否调试模式 */
  debug;
  constructor(options) {
    const { requestLog, tmpDir, logDir, logWriteInterval, logFileExpires, publicDir, tmpFileExpires, requestBody, debug } = options || {};
    this.requestLog = _4.defaultTo(requestLog, false);
    this.tmpDir = _4.defaultTo(tmpDir, "./tmp");
    this.logDir = _4.defaultTo(logDir, "./logs");
    this.logWriteInterval = _4.defaultTo(logWriteInterval, 200);
    this.logFileExpires = _4.defaultTo(logFileExpires, 262656e4);
    this.publicDir = _4.defaultTo(publicDir, "./public");
    this.tmpFileExpires = _4.defaultTo(tmpFileExpires, 864e5);
    this.requestBody = Object.assign(requestBody || {}, {
      enableTypes: ["json", "form", "text", "xml"],
      encoding: "utf-8",
      formLimit: "100mb",
      jsonLimit: "100mb",
      textLimit: "100mb",
      xmlLimit: "100mb",
      formidable: {
        maxFileSize: "100mb"
      },
      multipart: true,
      parsedMethods: ["POST", "PUT", "PATCH"]
    });
    this.debug = _4.defaultTo(debug, true);
  }
  get rootDirPath() {
    return path4.resolve();
  }
  get tmpDirPath() {
    return path4.resolve(this.tmpDir);
  }
  get logDirPath() {
    return path4.resolve(this.logDir);
  }
  get publicDirPath() {
    return path4.resolve(this.publicDir);
  }
  static load() {
    if (!fs4.pathExistsSync(CONFIG_PATH2)) return new _SystemConfig();
    const data = yaml2.parse(fs4.readFileSync(CONFIG_PATH2).toString());
    return new _SystemConfig(data);
  }
};
var system_config_default = SystemConfig.load();

// src/lib/config.ts
var Config = class {
  /** 服务配置 */
  service = service_config_default;
  /** 系统配置 */
  system = system_config_default;
};
var config_default = new Config();

// src/lib/logger.ts
import path5 from "path";
import _util from "util";
import "colors";
import _5 from "lodash";
import fs5 from "fs-extra";
import { format as dateFormat2 } from "date-fns";
var isVercelEnv = process.env.VERCEL;
var LogWriter = class {
  #buffers = [];
  constructor() {
    !isVercelEnv && fs5.ensureDirSync(config_default.system.logDirPath);
    !isVercelEnv && this.work();
  }
  push(content) {
    const buffer = Buffer.from(content);
    this.#buffers.push(buffer);
  }
  writeSync(buffer) {
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  async write(buffer) {
    !isVercelEnv && await fs5.appendFile(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), buffer);
  }
  flush() {
    if (!this.#buffers.length) return;
    !isVercelEnv && fs5.appendFileSync(path5.join(config_default.system.logDirPath, `/${util_default.getDateString()}.log`), Buffer.concat(this.#buffers));
  }
  work() {
    if (!this.#buffers.length) return setTimeout(this.work.bind(this), config_default.system.logWriteInterval);
    const buffer = Buffer.concat(this.#buffers);
    this.#buffers = [];
    this.write(buffer).finally(() => setTimeout(this.work.bind(this), config_default.system.logWriteInterval)).catch((err) => console.error("Log write error:", err));
  }
};
var LogText = class {
  /** @type {string} 日志级别 */
  level;
  /** @type {string} 日志文本 */
  text;
  /** @type {string} 日志来源 */
  source;
  /** @type {Date} 日志发生时间 */
  time = /* @__PURE__ */ new Date();
  constructor(level, ...params) {
    this.level = level;
    this.text = _util.format.apply(null, params);
    this.source = this.#getStackTopCodeInfo();
  }
  #getStackTopCodeInfo() {
    const unknownInfo = { name: "unknown", codeLine: 0, codeColumn: 0 };
    const stackArray = new Error().stack.split("\n");
    const text = stackArray[4];
    if (!text)
      return unknownInfo;
    const match = text.match(/at (.+) \((.+)\)/) || text.match(/at (.+)/);
    if (!match || !_5.isString(match[2] || match[1]))
      return unknownInfo;
    const temp = match[2] || match[1];
    const _match = temp.match(/([a-zA-Z0-9_\-\.]+)\:(\d+)\:(\d+)$/);
    if (!_match)
      return unknownInfo;
    const [, scriptPath, codeLine, codeColumn] = _match;
    return {
      name: scriptPath ? scriptPath.replace(/.js$/, "") : "unknown",
      path: scriptPath || null,
      codeLine: parseInt(codeLine || 0),
      codeColumn: parseInt(codeColumn || 0)
    };
  }
  toString() {
    return `[${dateFormat2(this.time, "yyyy-MM-dd HH:mm:ss.SSS")}][${this.level}][${this.source.name}<${this.source.codeLine},${this.source.codeColumn}>] ${this.text}`;
  }
};
var Logger = class _Logger {
  /** @type {Object} 系统配置 */
  config = {};
  /** @type {Object} 日志级别映射 */
  static Level = {
    Success: "success",
    Info: "info",
    Log: "log",
    Debug: "debug",
    Warning: "warning",
    Error: "error",
    Fatal: "fatal"
  };
  /** @type {Object} 日志级别文本颜色樱色 */
  static LevelColor = {
    [_Logger.Level.Success]: "green",
    [_Logger.Level.Info]: "brightCyan",
    [_Logger.Level.Debug]: "white",
    [_Logger.Level.Warning]: "brightYellow",
    [_Logger.Level.Error]: "brightRed",
    [_Logger.Level.Fatal]: "red"
  };
  #writer;
  constructor() {
    this.#writer = new LogWriter();
  }
  header() {
    this.#writer.writeSync(Buffer.from(`

===================== LOG START ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  footer() {
    this.#writer.flush();
    this.#writer.writeSync(Buffer.from(`

===================== LOG END ${dateFormat2(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss.SSS")} =====================

`));
  }
  success(...params) {
    const content = new LogText(_Logger.Level.Success, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Success]]);
    this.#writer.push(content + "\n");
  }
  info(...params) {
    const content = new LogText(_Logger.Level.Info, ...params).toString();
    console.info(content[_Logger.LevelColor[_Logger.Level.Info]]);
    this.#writer.push(content + "\n");
  }
  log(...params) {
    const content = new LogText(_Logger.Level.Log, ...params).toString();
    console.log(content[_Logger.LevelColor[_Logger.Level.Log]]);
    this.#writer.push(content + "\n");
  }
  debug(...params) {
    if (!config_default.system.debug) return;
    const content = new LogText(_Logger.Level.Debug, ...params).toString();
    console.debug(content[_Logger.LevelColor[_Logger.Level.Debug]]);
    this.#writer.push(content + "\n");
  }
  warn(...params) {
    const content = new LogText(_Logger.Level.Warning, ...params).toString();
    console.warn(content[_Logger.LevelColor[_Logger.Level.Warning]]);
    this.#writer.push(content + "\n");
  }
  error(...params) {
    const content = new LogText(_Logger.Level.Error, ...params).toString();
    console.error(content[_Logger.LevelColor[_Logger.Level.Error]]);
    this.#writer.push(content);
  }
  fatal(...params) {
    const content = new LogText(_Logger.Level.Fatal, ...params).toString();
    console.error(content[_Logger.LevelColor[_Logger.Level.Fatal]]);
    this.#writer.push(content);
  }
  destory() {
    this.#writer.destory();
  }
};
var logger_default = new Logger();

// src/lib/initialize.ts
process.setMaxListeners(Infinity);
process.on("uncaughtException", (err, origin) => {
  logger_default.error(`An unhandled error occurred: ${origin}`, err);
});
process.on("unhandledRejection", (_24, promise) => {
  promise.catch((err) => logger_default.error("An unhandled rejection occurred:", err));
});
process.on("warning", (warning) => logger_default.warn("System warning: ", warning));
process.on("exit", () => {
  logger_default.info("Service exit");
  logger_default.footer();
});
process.on("SIGTERM", () => {
  logger_default.warn("received kill signal");
  process.exit(2);
});
process.on("SIGINT", () => {
  process.exit(0);
});

// src/lib/server.ts
import Koa from "koa";
import KoaRouter from "koa-router";
import koaRange from "koa-range";
import koaCors from "koa2-cors";
import koaBody from "koa-body";
import _11 from "lodash";

// src/lib/request/Request.ts
import _7 from "lodash";

// src/lib/exceptions/Exception.ts
import assert from "assert";
import _6 from "lodash";
var Exception = class extends Error {
  /** 错误码 */
  errcode;
  /** 错误消息 */
  errmsg;
  /** 数据 */
  data;
  /** HTTP状态码 */
  httpStatusCode;
  /**
   * 构造异常
   * 
   * @param exception 异常
   * @param _errmsg 异常消息
   */
  constructor(exception, _errmsg) {
    assert(_6.isArray(exception), "Exception must be Array");
    const [errcode, errmsg] = exception;
    assert(_6.isFinite(errcode), "Exception errcode invalid");
    assert(_6.isString(errmsg), "Exception errmsg invalid");
    super(_errmsg || errmsg);
    this.errcode = errcode;
    this.errmsg = _errmsg || errmsg;
  }
  compare(exception) {
    const [errcode] = exception;
    return this.errcode == errcode;
  }
  setHTTPStatusCode(value) {
    this.httpStatusCode = value;
    return this;
  }
  setData(value) {
    this.data = _6.defaultTo(value, null);
    return this;
  }
};

// src/lib/exceptions/APIException.ts
var APIException = class extends Exception {
  /**
   * 构造异常
   * 
   * @param {[number, string]} exception 异常
   */
  constructor(exception, errmsg) {
    super(exception, errmsg);
  }
};

// src/api/consts/exceptions.ts
var exceptions_default = {
  API_TEST: [-9999, "API\u5F02\u5E38\u9519\u8BEF"],
  API_REQUEST_PARAMS_INVALID: [-2e3, "\u8BF7\u6C42\u53C2\u6570\u975E\u6CD5"],
  API_REQUEST_FAILED: [-2001, "\u8BF7\u6C42\u5931\u8D25"],
  API_TOKEN_EXPIRES: [-2002, "Token\u5DF2\u5931\u6548"],
  API_FILE_URL_INVALID: [-2003, "\u8FDC\u7A0B\u6587\u4EF6URL\u975E\u6CD5"],
  API_FILE_EXECEEDS_SIZE: [-2004, "\u8FDC\u7A0B\u6587\u4EF6\u8D85\u51FA\u5927\u5C0F"],
  API_CHAT_STREAM_PUSHING: [-2005, "\u5DF2\u6709\u5BF9\u8BDD\u6D41\u6B63\u5728\u8F93\u51FA"],
  API_CONTENT_FILTERED: [-2006, "\u5185\u5BB9\u7531\u4E8E\u5408\u89C4\u95EE\u9898\u5DF2\u88AB\u963B\u6B62\u751F\u6210"],
  API_IMAGE_GENERATION_FAILED: [-2007, "\u56FE\u50CF\u751F\u6210\u5931\u8D25"]
};

// src/lib/request/Request.ts
var Request = class {
  /** 请求方法 */
  method;
  /** 请求URL */
  url;
  /** 请求路径 */
  path;
  /** 请求载荷类型 */
  type;
  /** 请求headers */
  headers;
  /** 请求原始查询字符串 */
  search;
  /** 请求查询参数 */
  query;
  /** 请求URL参数 */
  params;
  /** 请求载荷 */
  body;
  /** 上传的文件 */
  files;
  /** 客户端IP地址 */
  remoteIP;
  /** 请求接受时间戳（毫秒） */
  time;
  constructor(ctx, options = {}) {
    const { time } = options;
    this.method = ctx.request.method;
    this.url = ctx.request.url;
    this.path = ctx.request.path;
    this.type = ctx.request.type;
    this.headers = ctx.request.headers || {};
    this.search = ctx.request.search;
    this.query = ctx.query || {};
    this.params = ctx.params || {};
    this.body = ctx.request.body || {};
    this._ctx = ctx;
    this.files = ctx.request.files || {};
    this.remoteIP = this.headers["X-Real-IP"] || this.headers["x-real-ip"] || this.headers["X-Forwarded-For"] || this.headers["x-forwarded-for"] || ctx.ip || null;
    this.time = Number(_7.defaultTo(time, util_default.timestamp()));
  }
  validate(key, fn) {
    try {
      const value = _7.get(this, key);
      if (fn) {
        if (fn(value) === false)
          throw `[Mismatch] -> ${fn}`;
      } else if (_7.isUndefined(value))
        throw "[Undefined]";
    } catch (err) {
      logger_default.warn(`Params ${key} invalid:`, err);
      throw new APIException(exceptions_default.API_REQUEST_PARAMS_INVALID, `Params ${key} invalid`);
    }
    return this;
  }
};

// src/lib/response/Response.ts
import mime2 from "mime";
import _9 from "lodash";

// src/lib/response/Body.ts
import _8 from "lodash";
var Body = class _Body {
  /** 状态码 */
  code;
  /** 状态消息 */
  message;
  /** 载荷 */
  data;
  /** HTTP状态码 */
  statusCode;
  constructor(options = {}) {
    const { code, message, data, statusCode } = options;
    this.code = Number(_8.defaultTo(code, 0));
    this.message = _8.defaultTo(message, "OK");
    this.data = _8.defaultTo(data, null);
    this.statusCode = Number(_8.defaultTo(statusCode, 200));
  }
  toObject() {
    return {
      code: this.code,
      message: this.message,
      data: this.data
    };
  }
  static isInstance(value) {
    return value instanceof _Body;
  }
};

// src/lib/response/Response.ts
var Response = class _Response {
  /** 响应HTTP状态码 */
  statusCode;
  /** 响应内容类型 */
  type;
  /** 响应headers */
  headers;
  /** 重定向目标 */
  redirect;
  /** 响应载荷 */
  body;
  /** 响应载荷大小 */
  size;
  /** 响应时间戳 */
  time;
  constructor(body, options = {}) {
    const { statusCode, type, headers, redirect, size, time } = options;
    this.statusCode = Number(_9.defaultTo(statusCode, Body.isInstance(body) ? body.statusCode : void 0));
    this.type = type;
    this.headers = headers;
    this.redirect = redirect;
    this.size = size;
    this.time = Number(_9.defaultTo(time, util_default.timestamp()));
    this.body = body;
  }
  injectTo(ctx) {
    this.redirect && ctx.redirect(this.redirect);
    this.statusCode && (ctx.status = this.statusCode);
    this.type && (ctx.type = mime2.getType(this.type) || this.type);
    const headers = this.headers || {};
    if (this.size && !headers["Content-Length"] && !headers["content-length"])
      headers["Content-Length"] = this.size;
    ctx.set(headers);
    if (Body.isInstance(this.body))
      ctx.body = this.body.toObject();
    else
      ctx.body = this.body;
  }
  static isInstance(value) {
    return value instanceof _Response;
  }
};

// src/lib/response/FailureBody.ts
import _10 from "lodash";

// src/lib/consts/exceptions.ts
var exceptions_default2 = {
  SYSTEM_ERROR: [-1e3, "\u7CFB\u7EDF\u5F02\u5E38"],
  SYSTEM_REQUEST_VALIDATION_ERROR: [-1001, "\u8BF7\u6C42\u53C2\u6570\u6821\u9A8C\u9519\u8BEF"],
  SYSTEM_NOT_ROUTE_MATCHING: [-1002, "\u65E0\u5339\u914D\u7684\u8DEF\u7531"]
};

// src/lib/response/FailureBody.ts
var FailureBody = class _FailureBody extends Body {
  constructor(error, _data) {
    let errcode, errmsg, data = _data, httpStatusCode = http_status_codes_default.OK;
    ;
    if (_10.isString(error))
      error = new Exception(exceptions_default2.SYSTEM_ERROR, error);
    else if (error instanceof APIException || error instanceof Exception)
      ({ errcode, errmsg, data, httpStatusCode } = error);
    else if (_10.isError(error))
      ({ errcode, errmsg, data, httpStatusCode } = new Exception(exceptions_default2.SYSTEM_ERROR, error.message));
    super({
      code: errcode || -1,
      message: errmsg || "Internal error",
      data,
      statusCode: httpStatusCode
    });
  }
  static isInstance(value) {
    return value instanceof _FailureBody;
  }
};

// src/lib/server.ts
var Server = class {
  app;
  router;
  constructor() {
    this.app = new Koa();
    this.app.use(koaCors());
    this.app.use(koaRange);
    this.router = new KoaRouter({ prefix: config_default.service.urlPrefix });
    this.app.use(async (ctx, next) => {
      if (ctx.request.type === "application/xml" || ctx.request.type === "application/ssml+xml")
        ctx.req.headers["content-type"] = "text/xml";
      try {
        await next();
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        new Response(failureBody).injectTo(ctx);
      }
    });
    this.app.use(koaBody(_11.clone(config_default.system.requestBody)));
    this.app.on("error", (err) => {
      if (["ECONNRESET", "ECONNABORTED", "EPIPE", "ECANCELED"].includes(err.code)) return;
      logger_default.error(err);
    });
    logger_default.success("Server initialized");
  }
  /**
   * 附加路由
   * 
   * @param routes 路由列表
   */
  attachRoutes(routes) {
    routes.forEach((route) => {
      const prefix = route.prefix || "";
      for (let method in route) {
        if (method === "prefix") continue;
        if (!_11.isObject(route[method])) {
          logger_default.warn(`Router ${prefix} ${method} invalid`);
          continue;
        }
        for (let uri in route[method]) {
          this.router[method](`${prefix}${uri}`, async (ctx) => {
            const { request, response } = await this.#requestProcessing(ctx, route[method][uri]);
            if (response != null && config_default.system.requestLog)
              logger_default.info(`<- ${request.method} ${request.url} ${response.time - request.time}ms`);
          });
        }
      }
      logger_default.info(`Route ${config_default.service.urlPrefix || ""}${prefix} attached`);
    });
    this.app.use(this.router.routes());
    this.app.use((ctx) => {
      const request = new Request(ctx);
      logger_default.debug(`-> ${ctx.request.method} ${ctx.request.url} request is not supported - ${request.remoteIP || "unknown"}`);
      const message = `[\u8BF7\u6C42\u6709\u8BEF]: \u6B63\u786E\u8BF7\u6C42\u4E3A POST -> /v1/chat/completions\uFF0C\u5F53\u524D\u8BF7\u6C42\u4E3A ${ctx.request.method} -> ${ctx.request.url} \u8BF7\u7EA0\u6B63`;
      logger_default.warn(message);
      const failureBody = new FailureBody(new Error(message));
      const response = new Response(failureBody);
      response.injectTo(ctx);
      if (config_default.system.requestLog)
        logger_default.info(`<- ${request.method} ${request.url} ${response.time - request.time}ms`);
    });
  }
  /**
   * 请求处理
   * 
   * @param ctx 上下文
   * @param routeFn 路由方法
   */
  #requestProcessing(ctx, routeFn) {
    return new Promise((resolve) => {
      const request = new Request(ctx);
      try {
        if (config_default.system.requestLog)
          logger_default.info(`-> ${request.method} ${request.url}`);
        routeFn(request).then((response) => {
          try {
            if (!Response.isInstance(response)) {
              const _response = new Response(response);
              _response.injectTo(ctx);
              return resolve({ request, response: _response });
            }
            response.injectTo(ctx);
            resolve({ request, response });
          } catch (err) {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response2 = new Response(failureBody);
            response2.injectTo(ctx);
            resolve({ request, response: response2 });
          }
        }).catch((err) => {
          try {
            logger_default.error(err);
            const failureBody = new FailureBody(err);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request, response });
          } catch (err2) {
            logger_default.error(err2);
            const failureBody = new FailureBody(err2);
            const response = new Response(failureBody);
            response.injectTo(ctx);
            resolve({ request, response });
          }
        });
      } catch (err) {
        logger_default.error(err);
        const failureBody = new FailureBody(err);
        const response = new Response(failureBody);
        response.injectTo(ctx);
        resolve({ request, response });
      }
    });
  }
  /**
   * 监听端口
   */
  async listen() {
    const host = config_default.service.host;
    const port = config_default.service.port;
    await Promise.all([
      new Promise((resolve, reject) => {
        if (host === "0.0.0.0" || host === "localhost" || host === "127.0.0.1")
          return resolve(null);
        this.app.listen(port, "localhost", (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      }),
      new Promise((resolve, reject) => {
        this.app.listen(port, host, (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      })
    ]);
    logger_default.success(`Server listening on port ${port} (${host})`);
  }
};
var server_default = new Server();

// src/api/routes/index.ts
import fs9 from "fs-extra";

// src/api/routes/chat.ts
import { PassThrough as PassThrough3 } from "stream";
import _17 from "lodash";

// src/api/controllers/chat.ts
import { PassThrough as PassThrough2 } from "stream";
import _13 from "lodash";
import axios2 from "axios";

// src/lib/audit-log.ts
import path6 from "path";
import { PassThrough } from "stream";
import _12 from "lodash";
import fs6 from "fs-extra";
var AUDIT_SUBDIR = "audit";
var SENSITIVE_KEY_PATTERN = /(authorization|cookie|password|secret|api[-_]?key|token)/i;
function normalizeName(value) {
  return String(value || "request").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase() || "request";
}
function ensureAuditDir() {
  const dirPath = path6.join(config_default.system.logDirPath, AUDIT_SUBDIR, util_default.getDateString());
  fs6.ensureDirSync(dirPath);
  return dirPath;
}
function maskSecret(value) {
  const text = String(value || "");
  if (!text) return text;
  if (text.length <= 8) return `${text.slice(0, 2)}***${text.slice(-1)}`;
  return `${text.slice(0, 4)}***${text.slice(-4)}`;
}
function extractPreviewText(value) {
  if (_12.isNil(value)) return "";
  if (_12.isString(value)) return value.slice(0, 200);
  if (_12.isArray(value)) return value.map((item) => extractPreviewText(item)).filter(Boolean).join("\n").slice(0, 200);
  if (_12.isPlainObject(value)) {
    if (_12.isString(_12.get(value, "text"))) return String(_12.get(value, "text")).slice(0, 200);
    if (_12.has(value, "content")) return extractPreviewText(_12.get(value, "content")).slice(0, 200);
    const serialized = _12.attempt(() => JSON.stringify(value));
    return _12.isError(serialized) ? "[object]" : String(serialized).slice(0, 200);
  }
  return String(value).slice(0, 200);
}
function safeSerialize(value, depth = 0, seen = /* @__PURE__ */ new WeakSet()) {
  var _a4;
  if (depth > 8) return "[MaxDepth]";
  if (_12.isNil(value) || _12.isBoolean(value) || _12.isNumber(value)) return value;
  if (_12.isString(value)) return value;
  if (typeof value === "bigint") return value.toString();
  if (_12.isDate(value)) return value.toISOString();
  if (_12.isError(value)) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }
  if (Buffer.isBuffer(value)) {
    return {
      type: "Buffer",
      byteLength: value.length,
      utf8: value.toString("utf8")
    };
  }
  if (util_default.isReadStream(value) || util_default.isWriteStream(value)) {
    return {
      type: "Stream",
      constructor: ((_a4 = value == null ? void 0 : value.constructor) == null ? void 0 : _a4.name) || "unknown"
    };
  }
  if (_12.isArray(value)) return value.map((item) => safeSerialize(item, depth + 1, seen));
  if (_12.isObject(value)) {
    const objectValue = value;
    if (seen.has(objectValue)) return "[Circular]";
    seen.add(objectValue);
    const result = {};
    for (const [key, item] of Object.entries(objectValue)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        result[key] = _12.isString(item) ? maskSecret(item) : "[REDACTED]";
        continue;
      }
      result[key] = safeSerialize(item, depth + 1, seen);
    }
    seen.delete(objectValue);
    return result;
  }
  return String(value);
}
function summarizeMessages(messages) {
  return (_12.isArray(messages) ? messages : []).map((message, index) => ({
    index,
    role: _12.get(message, "role") || "unknown",
    contentType: _12.isArray(_12.get(message, "content")) ? "array" : typeof _12.get(message, "content"),
    preview: extractPreviewText(_12.get(message, "content"))
  }));
}
function sanitizeHeaders(headers) {
  return safeSerialize(headers || {});
}
function serializeError(error) {
  return safeSerialize({
    name: _12.get(error, "name") || "Error",
    message: _12.get(error, "message") || String(error || ""),
    stack: _12.get(error, "stack"),
    status: _12.get(error, "status") || _12.get(error, "response.status"),
    code: _12.get(error, "code") || _12.get(error, "response.data.code"),
    data: _12.get(error, "data") || _12.get(error, "response.data")
  });
}
function createAuditContext(options) {
  const dirPath = ensureAuditDir();
  const requestId = `${normalizeName(options.endpoint)}_${util_default.getDateString("yyyyMMdd_HHmmss_SSS")}_${util_default.uuid(false).slice(0, 8)}`;
  const filePath = path6.join(dirPath, `${requestId}.jsonl`);
  const context = {
    requestId,
    endpoint: options.endpoint,
    route: options.route,
    model: options.model,
    stream: options.stream,
    filePath
  };
  appendAuditEvent(context, "audit.open", {
    endpoint: options.endpoint,
    route: options.route,
    model: options.model,
    stream: options.stream,
    filePath
  });
  logger_default.info(`[AUDIT] ${requestId} -> ${path6.relative(path6.resolve(), filePath)}`);
  return context;
}
function appendAuditEvent(context, stage, payload) {
  if (!context) return;
  try {
    fs6.appendFileSync(context.filePath, `${JSON.stringify({
      time: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: context.requestId,
      endpoint: context.endpoint,
      route: context.route,
      model: context.model,
      stream: context.stream === true,
      stage,
      payload: safeSerialize(payload)
    })}
`);
  } catch (error) {
    logger_default.error(`[AUDIT] write failed: ${error.message}`);
  }
}
function tapStreamForAudit(source, context, stage, buildPayload) {
  if (!context) return source;
  const output = new PassThrough();
  const buffers = [];
  let finalized = false;
  const finalize = (state) => {
    if (finalized) return;
    finalized = true;
    const streamText = Buffer.concat(buffers).toString("utf8");
    appendAuditEvent(context, stage, {
      state,
      byteLength: Buffer.byteLength(streamText),
      streamText,
      ...buildPayload ? buildPayload(streamText) : {}
    });
    if (!output.writableEnded) output.end();
  };
  source.on("data", (chunk) => {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    buffers.push(buffer);
    output.write(buffer);
  });
  source.once("error", (error) => {
    appendAuditEvent(context, `${stage}.error`, { error: serializeError(error) });
    finalize("error");
  });
  source.once("end", () => finalize("end"));
  source.once("close", () => finalize("close"));
  return output;
}

// src/lib/challenge.ts
import fs7 from "fs-extra";
var DeepSeekHash = class {
  wasmInstance;
  offset = 0;
  cachedUint8Memory = null;
  cachedTextEncoder = new TextEncoder();
  // 编码字符串到 WASM 内存
  encodeString(text, allocate, reallocate) {
    if (!reallocate) {
      const encoded = this.cachedTextEncoder.encode(text);
      const ptr2 = allocate(encoded.length, 1) >>> 0;
      const memory2 = this.getCachedUint8Memory();
      memory2.subarray(ptr2, ptr2 + encoded.length).set(encoded);
      this.offset = encoded.length;
      return ptr2;
    }
    const strLength = text.length;
    let ptr = allocate(strLength, 1) >>> 0;
    const memory = this.getCachedUint8Memory();
    let asciiLength = 0;
    for (; asciiLength < strLength; asciiLength++) {
      const charCode = text.charCodeAt(asciiLength);
      if (charCode > 127) break;
      memory[ptr + asciiLength] = charCode;
    }
    if (asciiLength !== strLength) {
      if (asciiLength > 0) {
        text = text.slice(asciiLength);
      }
      ptr = reallocate(ptr, strLength, asciiLength + text.length * 3, 1) >>> 0;
      const result = this.cachedTextEncoder.encodeInto(
        text,
        this.getCachedUint8Memory().subarray(ptr + asciiLength, ptr + asciiLength + text.length * 3)
      );
      asciiLength += result.written;
      ptr = reallocate(ptr, asciiLength + text.length * 3, asciiLength, 1) >>> 0;
    }
    this.offset = asciiLength;
    return ptr;
  }
  // 获取 WASM 内存视图
  getCachedUint8Memory() {
    if (this.cachedUint8Memory === null || this.cachedUint8Memory.byteLength === 0) {
      this.cachedUint8Memory = new Uint8Array(this.wasmInstance.memory.buffer);
    }
    return this.cachedUint8Memory;
  }
  // DeepSeekHash 计算函数
  calculateHash(algorithm, challenge, salt, difficulty, expireAt) {
    if (algorithm !== "DeepSeekHashV1") {
      throw new Error("Unsupported algorithm: " + algorithm);
    }
    const prefix = `${salt}_${expireAt}_`;
    try {
      const retptr = this.wasmInstance.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = this.encodeString(
        challenge,
        this.wasmInstance.__wbindgen_export_0,
        this.wasmInstance.__wbindgen_export_1
      );
      const len0 = this.offset;
      const ptr1 = this.encodeString(
        prefix,
        this.wasmInstance.__wbindgen_export_0,
        this.wasmInstance.__wbindgen_export_1
      );
      const len1 = this.offset;
      this.wasmInstance.wasm_solve(retptr, ptr0, len0, ptr1, len1, difficulty);
      const dataView = new DataView(this.wasmInstance.memory.buffer);
      const status = dataView.getInt32(retptr + 0, true);
      const value = dataView.getFloat64(retptr + 8, true);
      if (status === 0)
        return void 0;
      return value;
    } finally {
      this.wasmInstance.__wbindgen_add_to_stack_pointer(16);
    }
  }
  // 初始化 WASM 模块
  async init(wasmPath) {
    const imports = { wbg: {} };
    const wasmBuffer = await fs7.readFile(wasmPath);
    const { instance } = await WebAssembly.instantiate(wasmBuffer, imports);
    this.wasmInstance = instance.exports;
    return this.wasmInstance;
  }
};

// src/lib/token.ts
import { encode, encodeChat } from "gpt-tokenizer";
function calculateTokens(text) {
  try {
    if (!text || typeof text !== "string") return 0;
    const tokens = encode(text);
    return tokens.length || (text.length > 0 ? Math.ceil(text.length / 1.3) : 0);
  } catch (e) {
    console.error(`[TOKEN ERROR] Failed to encode text: ${e}`);
    return text ? Math.ceil(text.length / 1.3) : 0;
  }
}
function calculateMessagesTokens(messages, system, tools) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) return 0;
    const formattedMessages = messages.map((m) => {
      let role = m.role || "user";
      if (role === "human") role = "user";
      if (!["system", "user", "assistant", "tool"].includes(role)) {
        role = "user";
      }
      const msg = {
        role,
        content: ""
      };
      if (typeof m.content === "string") {
        msg.content = m.content;
      } else if (Array.isArray(m.content)) {
        msg.content = m.content.map((c) => c.text || "").join("");
      } else if (m.text) {
        msg.content = m.text;
      }
      if (m.name) msg.name = m.name;
      if (m.tool_calls) msg.tool_calls = m.tool_calls;
      if (m.function_call) msg.function_call = m.function_call;
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      return msg;
    });
    const tokens = encodeChat(formattedMessages, "gpt-5");
    if (tokens && tokens.length > 0) return tokens.length;
    let estimated = 0;
    for (const m of formattedMessages) {
      if (m.content) {
        estimated += calculateTokens(m.content) + 4;
      }
    }
    return estimated || messages.length * 5;
  } catch (e) {
    console.error(`[TOKEN ERROR] Failed to calculate chat tokens: ${e}`);
    return messages.length * 7;
  }
}

// src/api/controllers/chat.ts
var MODEL_NAME = "deepseek-chat";
var WASM_PATH = "./sha3_wasm_bg.7b9ca65ddd.wasm";
var ACCESS_TOKEN_EXPIRES = 3600;
var MAX_RETRY_COUNT = 3;
var RETRY_DELAY = 5e3;
var FAKE_HEADERS = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  Origin: "https://chat.deepseek.com",
  Pragma: "no-cache",
  Priority: "u=1, i",
  Referer: "https://chat.deepseek.com/",
  "Sec-Ch-Ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  "X-App-Version": "2.0.0",
  "X-Client-Locale": "zh_CN",
  "X-Client-Platform": "web",
  "X-Client-Version": "2.0.0"
};
var EVENT_COMMIT_ID = "6cf9c15d";
var ipAddress = "";
var accessTokenMap = /* @__PURE__ */ new Map();
var accessTokenRequestQueueMap = {};
function maskToken(token) {
  if (!token) return "";
  if (token.length <= 8) return `${token.slice(0, 2)}***${token.slice(-2)}`;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
function isConversationId(value) {
  return _13.isString(value) && /[0-9a-z\-]{36}@[0-9]+/.test(value);
}
function splitConversationId(value) {
  if (!isConversationId(value)) return null;
  const parts = value.split("@");
  const sessionId = parts[0];
  const messageId = Number(parts[parts.length - 1]);
  if (!sessionId || !Number.isFinite(messageId)) return null;
  return { sessionId, messageId };
}
function parseDeepSeekErrorBody(bodyText) {
  const raw = String(bodyText || "").trim();
  const parsed = _13.attempt(() => JSON.parse(raw));
  if (_13.isError(parsed) || !_13.isObject(parsed)) {
    return {
      raw,
      envelope: null,
      data: null,
      bizCode: void 0,
      bizMsg: ""
    };
  }
  const envelope = parsed;
  const data = _13.get(envelope, "data");
  return {
    raw,
    envelope,
    data,
    bizCode: _13.get(data, "biz_code") ?? _13.get(envelope, "biz_code"),
    bizMsg: String(_13.get(data, "biz_msg") || _13.get(envelope, "biz_msg") || _13.get(envelope, "msg") || "").trim()
  };
}
function isInvalidMessageIdPayload(payload) {
  const bizCode = _13.get(payload, "bizCode") ?? _13.get(payload, "biz_code") ?? _13.get(payload, "data.biz_code");
  const bizMsg = String(_13.get(payload, "bizMsg") || _13.get(payload, "biz_msg") || _13.get(payload, "data.biz_msg") || "").toLowerCase();
  return bizCode === 26 || bizMsg.includes("invalid message id");
}
function createInvalidStreamResponseError(contentType, parsedError) {
  const suffix = (parsedError == null ? void 0 : parsedError.bizMsg) ? `: ${parsedError.bizMsg}` : (parsedError == null ? void 0 : parsedError.raw) ? `: ${parsedError.raw.slice(0, 200)}` : "";
  return new APIException(
    exceptions_default.API_REQUEST_FAILED,
    `Stream response Content-Type invalid: ${contentType}${suffix}`
  ).setData((parsedError == null ? void 0 : parsedError.data) || (parsedError == null ? void 0 : parsedError.envelope) || null);
}
async function readStreamBody(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    let settled = false;
    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      handler(value);
    };
    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    stream.once("end", () => finish(resolve, Buffer.concat(chunks).toString("utf8")));
    stream.once("close", () => finish(resolve, Buffer.concat(chunks).toString("utf8")));
    stream.once("error", (error) => finish(reject, error));
  });
}
function summarizeContentForLog(content) {
  if (_13.isString(content)) {
    return {
      kind: "text",
      length: content.length
    };
  }
  if (_13.isArray(content)) {
    return {
      kind: "array",
      length: content.length,
      itemTypes: content.slice(0, 5).map((item) => {
        if (_13.isString(item)) return "text";
        if (_13.isPlainObject(item)) return _13.get(item, "type") || "object";
        return typeof item;
      })
    };
  }
  if (_13.isPlainObject(content)) {
    return {
      kind: _13.get(content, "type") || "object",
      keys: Object.keys(content).slice(0, 5)
    };
  }
  return {
    kind: typeof content
  };
}
function logMessageSummary(mode, model, messages) {
  const list = _13.isArray(messages) ? messages : [];
  const preview = list.slice(-8).map((message, index) => ({
    index: Math.max(list.length - 8, 0) + index,
    role: _13.get(message, "role") || "unknown",
    content: summarizeContentForLog(_13.get(message, "content"))
  }));
  logger_default.info(`[CHAT ${mode.toUpperCase()}] ${JSON.stringify({
    model,
    messageCount: list.length,
    omittedMessages: Math.max(list.length - preview.length, 0),
    messages: preview
  })}`);
}
async function getIPAddress() {
  var _a4;
  if (ipAddress) return ipAddress;
  const result = await axios2.get("https://chat.deepseek.com/", {
    headers: {
      ...FAKE_HEADERS,
      Cookie: generateCookie()
    },
    timeout: 15e3,
    validateStatus: () => true
  });
  const ip = (_a4 = result.data.match(/<meta name="ip" content="([\d.]+)">/)) == null ? void 0 : _a4[1];
  if (!ip) throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u83B7\u53D6IP\u5730\u5740\u5931\u8D25");
  logger_default.info(`\u5F53\u524DIP\u5730\u5740: ${ip}`);
  ipAddress = ip;
  return ip;
}
async function requestToken(refreshToken) {
  if (accessTokenRequestQueueMap[refreshToken])
    return new Promise(
      (resolve) => accessTokenRequestQueueMap[refreshToken].push(resolve)
    );
  accessTokenRequestQueueMap[refreshToken] = [];
  logger_default.info(`Refreshing token: ${maskToken(refreshToken)}`);
  const result = await (async () => {
    const result2 = await axios2.get(
      "https://chat.deepseek.com/api/v0/users/current",
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          ...FAKE_HEADERS
        },
        timeout: 15e3,
        validateStatus: () => true
      }
    );
    const { biz_data } = checkResult(result2, refreshToken);
    const { token } = biz_data;
    return {
      accessToken: token,
      refreshToken: token,
      refreshTime: util_default.unixTimestamp() + ACCESS_TOKEN_EXPIRES
    };
  })().then((result2) => {
    if (accessTokenRequestQueueMap[refreshToken]) {
      accessTokenRequestQueueMap[refreshToken].forEach(
        (resolve) => resolve(result2)
      );
      delete accessTokenRequestQueueMap[refreshToken];
    }
    logger_default.success(`Refresh successful`);
    return result2;
  }).catch((err) => {
    if (accessTokenRequestQueueMap[refreshToken]) {
      accessTokenRequestQueueMap[refreshToken].forEach(
        (resolve) => resolve(err)
      );
      delete accessTokenRequestQueueMap[refreshToken];
    }
    return err;
  });
  if (_13.isError(result)) throw result;
  return result;
}
async function acquireToken(refreshToken) {
  let result = accessTokenMap.get(refreshToken);
  if (!result) {
    result = await requestToken(refreshToken);
    accessTokenMap.set(refreshToken, result);
  }
  if (util_default.unixTimestamp() > result.refreshTime) {
    result = await requestToken(refreshToken);
    accessTokenMap.set(refreshToken, result);
  }
  return result.accessToken;
}
function generateCookie() {
  return `intercom-HWWAFSESTIME=${util_default.timestamp()}; HWWAFSESID=${util_default.generateRandomString({
    charset: "hex",
    length: 18
  })}; Hm_lvt_${util_default.uuid(false)}=${util_default.unixTimestamp()},${util_default.unixTimestamp()},${util_default.unixTimestamp()}; Hm_lpvt_${util_default.uuid(false)}=${util_default.unixTimestamp()}; _frid=${util_default.uuid(false)}; _fr_ssid=${util_default.uuid(false)}; _fr_pvid=${util_default.uuid(false)}`;
}
async function createSession(model, refreshToken) {
  const token = await acquireToken(refreshToken);
  const result = await axios2.post(
    "https://chat.deepseek.com/api/v0/chat_session/create",
    {
      character_id: null
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FAKE_HEADERS
      },
      timeout: 15e3,
      validateStatus: () => true
    }
  );
  const { biz_data } = checkResult(result, refreshToken);
  if (!biz_data || !biz_data.chat_session)
    throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u521B\u5EFA\u4F1A\u8BDD\u5931\u8D25\uFF0C\u53EF\u80FD\u662F\u8D26\u53F7\u6216IP\u5730\u5740\u88AB\u5C01\u7981");
  return biz_data.chat_session.id;
}
async function answerChallenge(response, targetPath) {
  const { algorithm, challenge, salt, difficulty, expire_at, signature } = response;
  const deepSeekHash = new DeepSeekHash();
  await deepSeekHash.init(WASM_PATH);
  const answer = deepSeekHash.calculateHash(algorithm, challenge, salt, difficulty, expire_at);
  return Buffer.from(JSON.stringify({
    algorithm,
    challenge,
    salt,
    answer,
    signature,
    target_path: targetPath
  })).toString("base64");
}
async function getChallengeResponse(refreshToken, targetPath) {
  const token = await acquireToken(refreshToken);
  const result = await axios2.post("https://chat.deepseek.com/api/v0/chat/create_pow_challenge", {
    target_path: targetPath
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...FAKE_HEADERS
      // Cookie: generateCookie()
    },
    timeout: 15e3,
    validateStatus: () => true
  });
  const { biz_data: { challenge } } = checkResult(result, refreshToken);
  return challenge;
}
async function createCompletion(model = MODEL_NAME, messages, refreshToken, refConvId, retryCount = 0, auditContext) {
  return (async () => {
    logMessageSummary("non-stream", model, messages);
    if (!isConversationId(refConvId))
      refConvId = void 0;
    const promptMessages = getPromptMessages(messages, refConvId);
    const prompt = messagesPrepare(promptMessages);
    appendAuditEvent(auditContext, "deepseek.prompt_prepared", {
      mode: "non-stream",
      model,
      refConvId,
      messages,
      messageSummary: summarizeMessages(messages),
      promptMessages,
      promptMessageSummary: summarizeMessages(promptMessages),
      prompt
    });
    const parts = (refConvId == null ? void 0 : refConvId.split("@")) || [];
    const refSessionId = parts[0];
    const refParentMsgId = parts.length > 1 ? parts[parts.length - 1] : void 0;
    const token = await acquireToken(refreshToken);
    const isSearchModel = model.includes("search");
    const isThinkingModel = model.includes("think") || model.includes("r1") || prompt.includes("\u6DF1\u5EA6\u601D\u8003") || prompt.startsWith("?") || prompt.startsWith("\uFF1F");
    const isExpertModel = model.includes("expert");
    const isSilentModel = model.includes("silent");
    const isFoldModel = model.includes("fold");
    if (isThinkingModel) {
      const thinkingQuota = await getThinkingQuota(refreshToken);
      if (thinkingQuota <= 0) {
        throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6DF1\u5EA6\u601D\u8003\u914D\u989D\u4E0D\u8DB3");
      }
    }
    const challengeResponse = await getChallengeResponse(refreshToken, "/api/v0/chat/completion");
    const challenge = await answerChallenge(challengeResponse, "/api/v0/chat/completion");
    logger_default.info(`\u63D2\u51B7\u9E21: ${challenge}`);
    const sessionId = refSessionId || await createSession(model, refreshToken);
    const payload = {
      chat_session_id: sessionId,
      parent_message_id: refParentMsgId ? parseInt(refParentMsgId) : null,
      model_type: isExpertModel ? "expert" : "default",
      prompt,
      ref_file_ids: [],
      thinking_enabled: isThinkingModel,
      search_enabled: isSearchModel,
      preempt: false
    };
    appendAuditEvent(auditContext, "deepseek.request", {
      mode: "non-stream",
      model,
      refConvId,
      sessionId,
      payload
    });
    const result = await axios2.post(
      "https://chat.deepseek.com/api/v0/chat/completion",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FAKE_HEADERS,
          Cookie: generateCookie(),
          "X-Ds-Pow-Response": challenge
        },
        // 120秒超时
        timeout: 12e4,
        validateStatus: () => true,
        responseType: "stream"
      }
    );
    await sendEvents(sessionId, refreshToken);
    if (result.headers["content-type"].indexOf("text/event-stream") == -1) {
      const bodyText = await readStreamBody(result.data);
      const parsedError = parseDeepSeekErrorBody(bodyText);
      appendAuditEvent(auditContext, "deepseek.invalid_content_type", {
        mode: "non-stream",
        contentType: result.headers["content-type"],
        bodyText,
        parsedError
      });
      logger_default.error(`Invalid response Content-Type: ${result.headers["content-type"]}`);
      if (bodyText) logger_default.error(bodyText);
      throw createInvalidStreamResponseError(result.headers["content-type"], parsedError);
    }
    const streamStartTime = util_default.timestamp();
    const promptTokens = calculateMessagesTokens(messages);
    const answer = await receiveStream(model, result.data, sessionId, promptTokens);
    appendAuditEvent(auditContext, "deepseek.response", {
      mode: "non-stream",
      sessionId,
      response: answer
    });
    const answerContent = String(_13.get(answer, "choices[0].message.content") || "").trim();
    const answerReasoning = String(_13.get(answer, "choices[0].message.reasoning_content") || "").trim();
    if (!answerContent && !answerReasoning) {
      appendAuditEvent(auditContext, "deepseek.empty_response", {
        mode: "non-stream",
        sessionId,
        response: answer
      });
      if (isConversationId(answer.id)) {
        appendAuditEvent(auditContext, "deepseek.regenerate.from_empty_response", {
          mode: "non-stream",
          sessionId,
          sourceConversationId: answer.id
        });
        return regenerateCompletion(
          model,
          refreshToken,
          answer.id,
          promptTokens,
          0,
          auditContext,
          {
            thinkingEnabled: isThinkingModel,
            searchEnabled: isSearchModel
          }
        );
      }
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "DeepSeek returned empty completion");
    }
    logger_default.success(
      `Stream has completed transfer ${util_default.timestamp() - streamStartTime}ms`
    );
    return answer;
  })().catch((err) => {
    var _a4;
    appendAuditEvent(auditContext, "deepseek.error", {
      mode: "non-stream",
      refConvId,
      retryCount,
      error: serializeError(err)
    });
    if (refConvId && ((_a4 = err.response) == null ? void 0 : _a4.status) === 404) {
      logger_default.warn(`DeepSeek session ${refConvId} not found (404), retrying with a fresh session...`);
      return createCompletion(
        model,
        messages,
        refreshToken,
        void 0,
        // 丢弃失效的会话 ID
        retryCount,
        // 保持重试计数
        auditContext
      );
    }
    if (refConvId && isInvalidMessageIdPayload(err)) {
      throw err;
    }
    if (retryCount < MAX_RETRY_COUNT) {
      logger_default.error(`Stream response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return createCompletion(
          model,
          messages,
          refreshToken,
          refConvId,
          retryCount + 1,
          auditContext
        );
      })();
    }
    throw err;
  });
}
async function regenerateCompletion(model = MODEL_NAME, refreshToken, refConvId, promptTokens = 1, retryCount = 0, auditContext, options = {}) {
  return (async () => {
    const conversation = splitConversationId(refConvId);
    if (!conversation)
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "Invalid conversation id for regenerate");
    const isSearchModel = options.searchEnabled ?? model.includes("search");
    const isThinkingModel = options.thinkingEnabled ?? (model.includes("think") || model.includes("r1"));
    if (isThinkingModel) {
      const thinkingQuota = await getThinkingQuota(refreshToken);
      if (thinkingQuota <= 0) {
        throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6DF1\u5EA6\u601D\u8003\u914D\u989D\u4E0D\u8DB3");
      }
    }
    const challengeResponse = await getChallengeResponse(refreshToken, "/api/v0/chat/regenerate");
    const challenge = await answerChallenge(challengeResponse, "/api/v0/chat/regenerate");
    logger_default.info(`\u63D2\u51B7\u9E21: ${challenge}`);
    const token = await acquireToken(refreshToken);
    const payload = {
      chat_session_id: conversation.sessionId,
      child_message_id: conversation.messageId,
      search_enabled: isSearchModel,
      thinking_enabled: isThinkingModel,
      user_options: null
    };
    appendAuditEvent(auditContext, "deepseek.regenerate.request", {
      model,
      refConvId,
      promptTokens,
      payload
    });
    const result = await axios2.post(
      "https://chat.deepseek.com/api/v0/chat/regenerate",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FAKE_HEADERS,
          Cookie: generateCookie(),
          "X-Ds-Pow-Response": challenge
        },
        timeout: 12e4,
        validateStatus: () => true,
        responseType: "stream"
      }
    );
    await sendEvents(conversation.sessionId, refreshToken);
    const contentType = String(result.headers["content-type"] || "");
    if (!contentType.includes("text/event-stream")) {
      const bodyText = await readStreamBody(result.data);
      const parsedError = parseDeepSeekErrorBody(bodyText);
      appendAuditEvent(auditContext, "deepseek.regenerate.invalid_content_type", {
        contentType,
        bodyText,
        parsedError,
        refConvId
      });
      logger_default.error(`Invalid regenerate response Content-Type: ${contentType}`);
      if (bodyText) logger_default.error(bodyText);
      throw createInvalidStreamResponseError(contentType, parsedError);
    }
    const streamStartTime = util_default.timestamp();
    const answer = await receiveStream(model, result.data, conversation.sessionId, promptTokens);
    appendAuditEvent(auditContext, "deepseek.regenerate.response", {
      model,
      refConvId,
      response: answer
    });
    const answerContent = String(_13.get(answer, "choices[0].message.content") || "").trim();
    const answerReasoning = String(_13.get(answer, "choices[0].message.reasoning_content") || "").trim();
    if (!answerContent && !answerReasoning) {
      appendAuditEvent(auditContext, "deepseek.regenerate.empty_response", {
        model,
        refConvId,
        response: answer
      });
      throw new APIException(exceptions_default.API_REQUEST_FAILED, "DeepSeek regenerate returned empty completion");
    }
    logger_default.success(
      `Regenerate stream has completed transfer ${util_default.timestamp() - streamStartTime}ms`
    );
    return answer;
  })().catch((err) => {
    var _a4;
    appendAuditEvent(auditContext, "deepseek.regenerate.error", {
      model,
      refConvId,
      retryCount,
      error: serializeError(err)
    });
    if (((_a4 = err.response) == null ? void 0 : _a4.status) === 404 || isInvalidMessageIdPayload(err)) {
      throw err;
    }
    if (retryCount < MAX_RETRY_COUNT) {
      logger_default.error(`Regenerate response error: ${err.stack}`);
      logger_default.warn(`Try regenerate again after ${RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return regenerateCompletion(
          model,
          refreshToken,
          refConvId,
          promptTokens,
          retryCount + 1,
          auditContext,
          options
        );
      })();
    }
    throw err;
  });
}
async function createCompletionStream(model = MODEL_NAME, messages, refreshToken, refConvId, retryCount = 0, auditContext) {
  return (async () => {
    logMessageSummary("stream", model, messages);
    if (!isConversationId(refConvId))
      refConvId = void 0;
    const promptMessages = getPromptMessages(messages, refConvId);
    const prompt = messagesPrepare(promptMessages);
    appendAuditEvent(auditContext, "deepseek.prompt_prepared", {
      mode: "stream",
      model,
      refConvId,
      messages,
      messageSummary: summarizeMessages(messages),
      promptMessages,
      promptMessageSummary: summarizeMessages(promptMessages),
      prompt
    });
    const parts = (refConvId == null ? void 0 : refConvId.split("@")) || [];
    const refSessionId = parts[0];
    const refParentMsgId = parts.length > 1 ? parts[parts.length - 1] : void 0;
    const isSearchModel = model.includes("search");
    const isThinkingModel = model.includes("think") || model.includes("r1") || prompt.includes("\u6DF1\u5EA6\u601D\u8003") || prompt.startsWith("?") || prompt.startsWith("\uFF1F");
    const isExpertModel = model.includes("expert");
    if (isThinkingModel) {
      const thinkingQuota = await getThinkingQuota(refreshToken);
      if (thinkingQuota <= 0) {
        throw new APIException(exceptions_default.API_REQUEST_FAILED, "\u6DF1\u5EA6\u601D\u8003\u914D\u989D\u4E0D\u8DB3");
      }
    }
    const challengeResponse = await getChallengeResponse(refreshToken, "/api/v0/chat/completion");
    const challenge = await answerChallenge(challengeResponse, "/api/v0/chat/completion");
    logger_default.info(`\u63D2\u51B7\u9E21: ${challenge}`);
    const sessionId = refSessionId || await createSession(model, refreshToken);
    const token = await acquireToken(refreshToken);
    const payload = {
      chat_session_id: sessionId,
      parent_message_id: refParentMsgId ? parseInt(refParentMsgId) : null,
      model_type: isExpertModel ? "expert" : "default",
      prompt,
      ref_file_ids: [],
      thinking_enabled: isThinkingModel,
      search_enabled: isSearchModel,
      preempt: false
    };
    appendAuditEvent(auditContext, "deepseek.request", {
      mode: "stream",
      model,
      refConvId,
      sessionId,
      payload
    });
    const result = await axios2.post(
      "https://chat.deepseek.com/api/v0/chat/completion",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...FAKE_HEADERS,
          Cookie: generateCookie(),
          "X-Ds-Pow-Response": challenge
        },
        // 120秒超时
        timeout: 12e4,
        validateStatus: () => true,
        responseType: "stream"
      }
    );
    await sendEvents(sessionId, refreshToken);
    if (result.headers["content-type"].indexOf("text/event-stream") == -1) {
      const bodyText = await readStreamBody(result.data);
      const parsedError = parseDeepSeekErrorBody(bodyText);
      appendAuditEvent(auditContext, "deepseek.invalid_content_type", {
        mode: "stream",
        contentType: result.headers["content-type"],
        bodyText,
        parsedError
      });
      logger_default.error(
        `Invalid response Content-Type:`,
        result.headers["content-type"]
      );
      if (bodyText) logger_default.error(bodyText);
      if (refConvId && isInvalidMessageIdPayload(parsedError)) {
        throw createInvalidStreamResponseError(result.headers["content-type"], parsedError);
      }
      const transStream = new PassThrough2();
      const promptTokens2 = calculateMessagesTokens(messages);
      const fallbackMessage = (parsedError == null ? void 0 : parsedError.bizMsg) || "\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u7B2C\u4E09\u65B9\u54CD\u5E94\u9519\u8BEF";
      transStream.end(
        `data: ${JSON.stringify({
          id: "",
          model: MODEL_NAME,
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content: fallbackMessage
              },
              finish_reason: "stop"
            }
          ],
          usage: { prompt_tokens: promptTokens2, completion_tokens: 0, total_tokens: promptTokens2 },
          created: util_default.unixTimestamp()
        })}

`
      );
      return tapStreamForAudit(transStream, auditContext, "deepseek.stream.response", () => ({
        mode: "stream",
        sessionId,
        fallback: true
      }));
    }
    const promptTokens = calculateMessagesTokens(messages);
    const streamStartTime = util_default.timestamp();
    const stream = await createTransStream(model, result.data, sessionId, promptTokens, () => {
      logger_default.success(
        `Stream has completed transfer ${util_default.timestamp() - streamStartTime}ms`
      );
    });
    return tapStreamForAudit(stream, auditContext, "deepseek.stream.response", () => ({
      mode: "stream",
      sessionId,
      refConvId
    }));
  })().catch((err) => {
    var _a4;
    appendAuditEvent(auditContext, "deepseek.error", {
      mode: "stream",
      refConvId,
      retryCount,
      error: serializeError(err)
    });
    if (refConvId && ((_a4 = err.response) == null ? void 0 : _a4.status) === 404) {
      logger_default.warn(`DeepSeek session ${refConvId} not found (404), retrying stream with a fresh session...`);
      return createCompletionStream(
        model,
        messages,
        refreshToken,
        void 0,
        // 丢弃失效的会话 ID
        retryCount,
        // 保持重试计数
        auditContext
      );
    }
    if (refConvId && isInvalidMessageIdPayload(err)) {
      throw err;
    }
    if (retryCount < MAX_RETRY_COUNT) {
      logger_default.error(`Stream response error: ${err.stack}`);
      logger_default.warn(`Try again after ${RETRY_DELAY / 1e3}s...`);
      return (async () => {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return createCompletionStream(
          model,
          messages,
          refreshToken,
          refConvId,
          retryCount + 1,
          auditContext
        );
      })();
    }
    throw err;
  });
}
function stringifyMessageContent(content) {
  if (_13.isNil(content)) return "";
  if (_13.isString(content)) return content;
  const stringifyStructuredPart = (item) => {
    if (_13.isString(item)) return item;
    if (!_13.isObject(item)) return "";
    const type = _13.get(item, "type");
    if (type === "text" || type === "input_text" || type === "output_text") return _13.get(item, "text") || "";
    if (type === "message") return stringifyMessageContent(_13.get(item, "content"));
    if (type === "agent_message") return _13.get(item, "text") || stringifyMessageContent(_13.get(item, "content"));
    if (type === "reasoning") return _13.get(item, "text") || _13.get(item, "summary") || stringifyMessageContent(_13.get(item, "content"));
    if (type === "tool_result") return `Tool result (${_13.get(item, "tool_use_id") || "unknown"}):
${stringifyMessageContent(_13.get(item, "content"))}`;
    if (type === "tool_use") return `Assistant requested tool ${_13.get(item, "name") || "unknown"}: ${JSON.stringify(_13.get(item, "input") || {})}`;
    if (type === "function_call") return `Assistant requested tool ${_13.get(item, "name") || "unknown"}: ${_13.get(item, "arguments") || "{}"}`;
    if (type === "function_call_output") return `Tool result (${_13.get(item, "call_id") || "unknown"}):
${stringifyMessageContent(_13.get(item, "output"))}`;
    if (type === "custom_tool_call") return `Assistant requested tool ${_13.get(item, "name") || "unknown"}: ${_13.isString(_13.get(item, "input") ?? _13.get(item, "arguments")) ? _13.get(item, "input") ?? _13.get(item, "arguments") : JSON.stringify((_13.get(item, "input") ?? _13.get(item, "arguments")) || {})}`;
    if (type === "custom_tool_call_output") return `Tool result (${_13.get(item, "call_id") || _13.get(item, "id") || "unknown"}):
${stringifyMessageContent(_13.get(item, "output") ?? _13.get(item, "content"))}`;
    if (type === "mcp_tool_call") {
      const server = _13.get(item, "server");
      const name = _13.get(item, "tool") || _13.get(item, "name") || "unknown";
      const resultText = [
        stringifyMessageContent(_13.get(item, "result.content")),
        _13.isNil(_13.get(item, "result.structured_content")) ? "" : JSON.stringify(_13.get(item, "result.structured_content")),
        _13.get(item, "error.message") || ""
      ].filter(Boolean).join("\n");
      if (resultText || ["completed", "failed"].includes(String(_13.get(item, "status") || "")))
        return `Tool result (${server ? `${server}:` : ""}${name}):
${resultText || String(_13.get(item, "status") || "completed")}`;
      return `Assistant requested tool ${name}: ${JSON.stringify((_13.get(item, "arguments") ?? _13.get(item, "input")) || {})}`;
    }
    if (type === "command_execution") {
      const command = String(_13.get(item, "command") || "").trim();
      const exitCode = _13.has(item, "exit_code") ? `
Exit code: ${_13.get(item, "exit_code")}` : "";
      const aggregatedOutput = String(_13.get(item, "aggregated_output") || "").trim();
      if (aggregatedOutput || _13.has(item, "exit_code") || ["completed", "failed"].includes(String(_13.get(item, "status") || "")))
        return `Tool result (command_execution):
Command: ${command}${exitCode}${aggregatedOutput ? `
${aggregatedOutput}` : ""}`.trim();
      return `Assistant requested tool shell: ${JSON.stringify({ command })}`;
    }
    if (type === "file_change") {
      const changesList = _13.get(item, "changes");
      const changes = _13.isArray(changesList) ? changesList.map((change) => `${_13.get(change, "kind") || "update"} ${_13.get(change, "path") || "unknown"}`).join("\n") : "";
      const status = _13.get(item, "status");
      return [changes ? "Tool result (file_change):" : "", changes, status ? `status: ${status}` : ""].filter(Boolean).join("\n");
    }
    if (type === "web_search") {
      const query = _13.get(item, "query");
      return query ? `Assistant requested tool web_search: ${JSON.stringify({ query })}` : "";
    }
    if (type === "todo_list") {
      const todoItems = _13.get(item, "items");
      const items = _13.isArray(todoItems) ? todoItems.map((todo) => `- [${_13.get(todo, "completed") ? "x" : " "}] ${_13.get(todo, "text") || _13.get(todo, "content") || ""}`).filter(Boolean).join("\n") : "";
      return items ? `Todo list:
${items}` : "";
    }
    if (type === "error") return _13.get(item, "message") || "";
    return _13.get(item, "text") || (_13.has(item, "content") ? stringifyMessageContent(_13.get(item, "content")) : "");
  };
  if (Array.isArray(content)) {
    return content.map(stringifyStructuredPart).filter(Boolean).join("\n");
  }
  if (_13.isObject(content)) return stringifyStructuredPart(content) || JSON.stringify(content);
  return String(content);
}
function messageToPreparedText(message) {
  const parts = [stringifyMessageContent(message.content)].filter(Boolean);
  if (Array.isArray(message.tool_calls)) {
    for (const toolCall of message.tool_calls) {
      const name = _13.get(toolCall, "function.name") || _13.get(toolCall, "name") || "unknown";
      const args = _13.get(toolCall, "function.arguments") || _13.get(toolCall, "arguments") || "{}";
      parts.push(`Assistant requested tool ${name}: ${_13.isString(args) ? args : JSON.stringify(args)}`);
    }
  }
  if (message.role === "tool") {
    const toolUseId = message.tool_call_id || message.name || "unknown";
    return `Tool result (${toolUseId}):
${parts.join("\n")}`;
  }
  return parts.join("\n");
}
function messagesPrepare(messages) {
  const processedMessages = messages.map((message) => {
    let text = messageToPreparedText(message);
    if (text.endsWith("FINISHED")) {
      text = text.substring(0, text.length - 8).trim();
    }
    return { role: message.role, text };
  });
  if (processedMessages.length === 0) return "";
  const mergedBlocks = [];
  let currentBlock = { ...processedMessages[0] };
  for (let i = 1; i < processedMessages.length; i++) {
    const msg = processedMessages[i];
    if (msg.role === currentBlock.role) {
      currentBlock.text += `

${msg.text}`;
    } else {
      mergedBlocks.push(currentBlock);
      currentBlock = { ...msg };
    }
  }
  mergedBlocks.push(currentBlock);
  return mergedBlocks.map((block, index) => {
    if (block.role === "assistant") {
      return `<\uFF5CAssistant\uFF5C>${block.text}<\uFF5Cend of sentence\uFF5C>`;
    }
    if (block.role === "user" || block.role === "system") {
      return index > 0 ? `<\uFF5CUser\uFF5C>${block.text}` : block.text;
    }
    return block.text;
  }).join("").replace(/\!\[.+\]\(.+\)/g, "");
}
function isToolResultLikeMessage(message) {
  if (!message) return false;
  if (message.role === "tool") return true;
  const preparedText = messageToPreparedText(message).trim();
  return preparedText.startsWith("Tool result (");
}
function isAssistantToolRequestMessage(message) {
  if (!message || message.role !== "assistant") return false;
  const preparedText = messageToPreparedText(message);
  return preparedText.includes("Assistant requested tool ");
}
function getPromptMessages(messages, refConvId) {
  if (!refConvId || messages.length <= 1) return messages;
  const systemMessages = messages.filter((message) => (message == null ? void 0 : message.role) === "system");
  const historyMessages = messages.filter((message) => (message == null ? void 0 : message.role) !== "system");
  if (!historyMessages.length) return systemMessages;
  let startIndex = historyMessages.length - 1;
  const latestMessage = historyMessages[startIndex];
  if (isToolResultLikeMessage(latestMessage)) {
    while (startIndex > 0 && isToolResultLikeMessage(historyMessages[startIndex - 1])) {
      startIndex--;
    }
    if (startIndex > 0 && isAssistantToolRequestMessage(historyMessages[startIndex - 1])) {
      startIndex--;
    }
    const previousUserIndex = _13.findLastIndex(
      historyMessages.slice(0, startIndex),
      (message) => (message == null ? void 0 : message.role) === "user" && !isToolResultLikeMessage(message)
    );
    if (previousUserIndex !== -1) {
      startIndex = previousUserIndex;
    }
  } else {
    const latestUserIndex = _13.findLastIndex(historyMessages, (message) => (message == null ? void 0 : message.role) === "user");
    if (latestUserIndex !== -1) {
      startIndex = latestUserIndex;
    }
  }
  const recentMessages = historyMessages.slice(startIndex);
  if (!systemMessages.length) return recentMessages;
  return [...systemMessages, ...recentMessages];
}
function checkResult(result, refreshToken) {
  if (!result.data) return null;
  const { code, data, msg } = result.data;
  if (!_13.isFinite(code)) return result.data;
  if (code === 0) return data;
  if (code == 40003) accessTokenMap.delete(refreshToken);
  throw new APIException(exceptions_default.API_REQUEST_FAILED, `[\u8BF7\u6C42deepseek\u5931\u8D25]: ${msg}`);
}
function getFragmentInitialContent(fragment) {
  if (!fragment || typeof fragment !== "object") return "";
  return typeof fragment.content === "string" ? fragment.content : "";
}
async function receiveStream(model, stream, refConvId, promptTokens = 1) {
  const { createParser } = await import("eventsource-parser");
  logger_default.info(`[NON-STREAM] Receiving stream to accumulate full response for model: ${model}`);
  let accumulatedContent = "";
  let accumulatedThinkingContent = "";
  let messageId = "";
  let searchResults = [];
  const created = util_default.unixTimestamp();
  let currentPath = model.includes("think") || model.includes("r1") ? "thinking" : "content";
  return new Promise((resolve, reject) => {
    const parser = createParser((event) => {
      var _a4, _b4;
      try {
        if (event.type !== "event" || !event.data) return;
        const chunk = _13.attempt(() => JSON.parse(event.data));
        if (_13.isError(chunk)) return;
        if (chunk.response_message_id && !messageId) {
          messageId = chunk.response_message_id;
        }
        if (typeof chunk.v === "string" && chunk.v.includes("FINISHED")) {
          logger_default.info(`[DEBUG] Received FINISHED chunk. Path: ${chunk.p}, Value: ${chunk.v}, CurrentPath: ${currentPath}`);
        }
        if (chunk.p) {
          const vType = Array.isArray(chunk.v) ? `array[${chunk.v.length}]` : typeof chunk.v;
          const vPreview = Array.isArray(chunk.v) ? JSON.stringify(chunk.v.map((item) => ({ type: item.type, id: item.id }))) : typeof chunk.v === "string" ? chunk.v.substring(0, 50) : String(chunk.v);
          logger_default.info(`[NON-STREAM PATH] p="${chunk.p}" o="${chunk.o || ""}" vType=${vType} vPreview=${vPreview} currentPath=${currentPath}`);
        }
        const fragments = Array.isArray(chunk.v) ? chunk.v : ((_b4 = (_a4 = chunk.v) == null ? void 0 : _a4.response) == null ? void 0 : _b4.fragments) || [];
        if (fragments.length) {
          for (const fragment of fragments) {
            const fragType = fragment.type;
            if (fragType === "THINK") currentPath = "thinking";
            else if (fragType === "RESPONSE") currentPath = "content";
            const initialContent = getFragmentInitialContent(fragment);
            if (initialContent) {
              if (currentPath === "thinking") accumulatedThinkingContent += initialContent;
              else accumulatedContent += initialContent;
            }
          }
        }
        if (chunk.p) {
          if (chunk.p.includes("fragments")) {
            if (chunk.p.endsWith("/content")) {
            }
          } else if (chunk.p.includes("thinking_content") || chunk.p.includes("thought")) {
            currentPath = "thinking";
          } else if (chunk.p.includes("response/content")) {
            currentPath = "content";
          }
          logger_default.info(`[NON-STREAM PATH] => currentPath is now: ${currentPath}`);
        }
        if (typeof chunk.v === "string" && chunk.v !== "FINISHED") {
          if (currentPath === "thinking") {
            accumulatedThinkingContent += chunk.v;
          } else if (chunk.v !== "SEARCH") {
            accumulatedContent += chunk.v;
          }
        }
        const isSearchResults = (chunk.p === "response/search_results" || chunk.p && chunk.p.endsWith("/results") && chunk.p.includes("fragments")) && Array.isArray(chunk.v);
        if (isSearchResults) {
          if (chunk.o !== "BATCH") {
            if (searchResults.length === 0) {
              searchResults = chunk.v;
            } else {
              searchResults = [...searchResults, ...chunk.v];
            }
          } else {
            chunk.v.forEach((op) => {
              const match = op.p.match(/\/(\d+)\/(\w+)$/);
              if (match) {
                const index = parseInt(match[1], 10);
                const key = match[2];
                if (searchResults[index]) {
                  searchResults[index][key] = op.v;
                } else {
                  searchResults[index] = { [key]: op.v };
                }
              }
            });
          }
        }
      } catch (err) {
        logger_default.error(`[NON-STREAM] Error parsing chunk: ${err}`);
      }
    });
    stream.on("data", (buffer) => parser.feed(buffer.toString()));
    stream.once("error", (err) => reject(err));
    stream.once("close", () => {
      logger_default.info(`[NON-STREAM] Stream closed. Content len: ${accumulatedContent.length}, Thinking len: ${accumulatedThinkingContent.length}`);
      if (accumulatedContent.endsWith("FINISHED")) {
        logger_default.warn(`[NON-STREAM] WARNING: Content ends with FINISHED! Accumulated: ${accumulatedContent.slice(-20)}`);
      }
      const completionTokens = calculateTokens(accumulatedContent + accumulatedThinkingContent);
      const finalResponse = {
        id: `${refConvId}@${messageId}`,
        model,
        object: "chat.completion",
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: accumulatedContent.trim(),
            reasoning_content: accumulatedThinkingContent.trim(),
            citations: searchResults.filter((r) => r.cite_index).sort((a, b) => a.cite_index - b.cite_index).map((r) => ({
              index: r.cite_index,
              title: r.title,
              url: r.url
            }))
          },
          finish_reason: "stop"
        }],
        usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens },
        created
      };
      logger_default.success(`[NON-STREAM] Resolving with final response: ${JSON.stringify(finalResponse, null, 2)}`);
      resolve(finalResponse);
    });
  });
}
async function createTransStream(model, stream, refConvId, promptTokens = 1, endCallback) {
  const { createParser } = await import("eventsource-parser");
  const isThinkingModel = model.includes("think") || model.includes("r1");
  const isSilentModel = model.includes("silent");
  const isFoldModel = (model.includes("fold") || model.includes("search")) && !isThinkingModel;
  const isSearchSilentModel = model.includes("search-silent");
  logger_default.info(`[STREAM] Model: ${model}, isThinking: ${isThinkingModel}, isSilent: ${isSilentModel}, isFold: ${isFoldModel}, isSearchSilent: ${isSearchSilentModel}`);
  let isFirstChunk = true;
  let messageId = "";
  const created = util_default.unixTimestamp();
  const transStream = new PassThrough2();
  let currentPath = model.includes("think") || model.includes("r1") ? "thinking" : "content";
  let searchResults = [];
  let thinkingStarted = false;
  let accumulatedContent = "";
  let accumulatedThinkingContent = "";
  const parser = createParser((event) => {
    var _a4, _b4;
    try {
      if (event.type !== "event") return;
      if (event.event === "close" || event.data.trim() === "[DONE]") {
        if (isFoldModel && thinkingStarted) {
          transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: "</pre></details>" }, finish_reason: null }], created })}

`);
        }
        if (searchResults.length > 0 && !isSearchSilentModel) {
          const citations = searchResults.filter((r) => r.cite_index).sort((a, b) => a.cite_index - b.cite_index).map((r) => `**${r.cite_index}.** [${r.title}](${r.url})`).join("\n");
          if (citations) {
            const citationContent = `

${citations}`;
            transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: citationContent }, finish_reason: null }], created })}

`);
          }
        }
        const completionTokens = calculateTokens(accumulatedContent + accumulatedThinkingContent);
        transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens }, created })}

`);
        !transStream.closed && transStream.end("data: [DONE]\n\n");
        endCallback && endCallback();
        return;
      }
      if (!event.data) return;
      const chunk = _13.attempt(() => JSON.parse(event.data));
      if (_13.isError(chunk)) return;
      if (chunk.response_message_id && !messageId) messageId = chunk.response_message_id;
      if (chunk.p) {
        const vType = Array.isArray(chunk.v) ? `array[${chunk.v.length}]` : typeof chunk.v;
        const vPreview = Array.isArray(chunk.v) ? JSON.stringify(chunk.v.map((item) => ({ type: item.type, id: item.id }))) : typeof chunk.v === "string" ? chunk.v.substring(0, 50) : String(chunk.v);
        logger_default.info(`[STREAM PATH] p="${chunk.p}" o="${chunk.o || ""}" vType=${vType} vPreview=${vPreview} currentPath=${currentPath}`);
      }
      let fragmentInitialDeltas = [];
      const fragments = Array.isArray(chunk.v) ? chunk.v : ((_b4 = (_a4 = chunk.v) == null ? void 0 : _a4.response) == null ? void 0 : _b4.fragments) || [];
      if (fragments.length) {
        for (const fragment of fragments) {
          const fragType = fragment.type;
          if (fragType === "THINK") currentPath = "thinking";
          else if (fragType === "RESPONSE") currentPath = "content";
          const initialContent = getFragmentInitialContent(fragment);
          if (initialContent) {
            fragmentInitialDeltas.push({ content: initialContent, path: currentPath === "thinking" ? "thinking" : "content" });
            if (currentPath === "thinking") accumulatedThinkingContent += initialContent;
            else accumulatedContent += initialContent;
          }
        }
      }
      if (chunk.p) {
        if (chunk.p.includes("fragments")) {
        } else if (chunk.p.includes("thinking_content") || chunk.p.includes("thought")) {
          currentPath = "thinking";
        } else if (chunk.p.includes("response/content")) {
          currentPath = "content";
        }
        logger_default.info(`[STREAM PATH] => currentPath is now: ${currentPath}`);
      }
      for (const fragmentDelta of fragmentInitialDeltas) {
        const delta = {};
        if (isFirstChunk) {
          delta.role = "assistant";
          isFirstChunk = false;
        }
        const content = isSearchSilentModel ? fragmentDelta.content.replace(/\[citation:(\d+)\]/g, "") : fragmentDelta.content.replace(/\[citation:(\d+)\]/g, "[$1]");
        if (fragmentDelta.path === "thinking") {
          if (isSilentModel) continue;
          if (isFoldModel) {
            if (!thinkingStarted) {
              thinkingStarted = true;
              delta.content = `<details><summary>\u601D\u8003\u8FC7\u7A0B</summary>${content}`;
            } else {
              delta.content = content;
            }
          } else {
            delta.reasoning_content = content;
          }
        } else {
          if (isFoldModel && thinkingStarted) {
            delta.content = `</details>${content}`;
            thinkingStarted = false;
          } else {
            delta.content = content;
          }
        }
        transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta, finish_reason: null }], created })}

`);
      }
      if (typeof chunk.v === "string" && chunk.v.includes("FINISHED")) {
        logger_default.info(`[STREAM DEBUG] Received FINISHED chunk. Path: ${chunk.p}, Value: ${chunk.v}, CurrentPath: ${currentPath}`);
      }
      const isSearchResults = (chunk.p === "response/search_results" || chunk.p && chunk.p.endsWith("/results") && chunk.p.includes("fragments")) && Array.isArray(chunk.v);
      if (isSearchResults) {
        if (chunk.o !== "BATCH") {
          if (searchResults.length === 0) {
            searchResults = chunk.v;
          } else {
            searchResults = [...searchResults, ...chunk.v];
          }
          logger_default.info(`[STREAM SEARCH] Captured ${chunk.v.length} search results from path: ${chunk.p}`);
        } else {
          chunk.v.forEach((op) => {
            const match = op.p.match(/\/(\d+)\/(\w+)$/);
            if (match) {
              const index = parseInt(match[1], 10);
              const key = match[2];
              if (searchResults[index]) {
                searchResults[index][key] = op.v;
              } else {
                searchResults[index] = { [key]: op.v };
              }
            }
          });
        }
        return;
      }
      const isContentPath = !chunk.p || chunk.p.includes("content") || chunk.p.includes("thought");
      if (typeof chunk.v === "string" && chunk.v !== "FINISHED" && isContentPath && chunk.v !== "SEARCH") {
        const delta = {};
        if (isFirstChunk) {
          delta.role = "assistant";
          isFirstChunk = false;
        }
        const content = isSearchSilentModel ? chunk.v.replace(/\[citation:(\d+)\]/g, "") : chunk.v.replace(/\[citation:(\d+)\]/g, "[$1]");
        if (chunk.p && (chunk.p.includes("thinking") || chunk.p.includes("thought"))) {
          currentPath = "thinking";
        } else if (chunk.p && chunk.p.includes("fragments") && chunk.p.endsWith("/content") && !chunk.v.includes("FINISHED")) {
        }
        if (currentPath === "thinking") {
          accumulatedThinkingContent += content;
          if (isSilentModel) return;
          if (isFoldModel) {
            if (!thinkingStarted) {
              thinkingStarted = true;
              delta.content = `<details><summary>\u601D\u8003\u8FC7\u7A0B</summary>${content}`;
            } else {
              delta.content = content;
            }
          } else {
            delta.reasoning_content = content;
          }
        } else {
          accumulatedContent += content;
          if (isFoldModel && thinkingStarted) {
            delta.content = `</details>${content}`;
            thinkingStarted = false;
          } else {
            delta.content = content;
          }
        }
        transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta, finish_reason: null }], created })}

`);
      }
    } catch (err) {
      logger_default.error(`[STREAM] Error processing chunk: ${err}`);
      !transStream.closed && transStream.end("data: [DONE]\n\n");
    }
  });
  stream.on("data", (buffer) => parser.feed(buffer.toString()));
  stream.once("error", (err) => {
    logger_default.error(`[STREAM] Stream error: ${err}`);
    !transStream.closed && transStream.end("data: [DONE]\n\n");
  });
  stream.once("close", () => {
    if (!transStream.closed) {
      if (isFoldModel && thinkingStarted) {
        transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: "</details>" }, finish_reason: null }], created })}

`);
      }
      if (searchResults.length > 0 && !isSearchSilentModel) {
        const citations = searchResults.filter((r) => r.cite_index).sort((a, b) => a.cite_index - b.cite_index).map((r) => `**${r.cite_index}.** [${r.title}](${r.url})`).join("\n");
        if (citations) {
          const citationContent = `

**Citations:**
${citations}`;
          transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: citationContent }, finish_reason: null }], created })}

`);
        }
      }
      transStream.write(`data: ${JSON.stringify({ id: `${refConvId}@${messageId}`, model, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: "stop" }], created })}

`);
      transStream.end("data: [DONE]\n\n");
      endCallback && endCallback();
    }
  });
  return transStream;
}
function tokenSplit(authorization) {
  return authorization.replace("Bearer ", "").split(",");
}
async function getTokenLiveStatus(refreshToken) {
  const token = await acquireToken(refreshToken);
  const result = await axios2.get(
    "https://chat.deepseek.com/api/v0/users/current",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FAKE_HEADERS,
        Cookie: generateCookie()
      },
      timeout: 15e3,
      validateStatus: () => true
    }
  );
  try {
    const { token: token2 } = checkResult(result, refreshToken);
    return !!token2;
  } catch (err) {
    return false;
  }
}
async function sendEvents(refConvId, refreshToken) {
  try {
    const token = await acquireToken(refreshToken);
    const sessionId = `session_v0_${Math.random().toString(36).slice(2)}`;
    const timestamp = util_default.timestamp();
    const fakeDuration1 = Math.floor(Math.random() * 1e3);
    const fakeDuration2 = Math.floor(Math.random() * 1e3);
    const fakeDuration3 = Math.floor(Math.random() * 1e3);
    const ipAddress2 = await getIPAddress();
    const response = await axios2.post("https://chat.deepseek.com/api/v0/events", {
      "events": [
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp,
          "event_name": "__reportEvent",
          "event_message": "\u8C03\u7528\u4E0A\u62A5\u4E8B\u4EF6\u63A5\u53E3",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "method": "post",
            "url": "/api/v0/events",
            "path": "/api/v0/events"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 100 + Math.floor(Math.random() * 1e3),
          "event_name": "__reportEventOk",
          "event_message": "\u8C03\u7528\u4E0A\u62A5\u4E8B\u4EF6\u63A5\u53E3\u6210\u529F",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "method": "post",
            "url": "/api/v0/events",
            "path": "/api/v0/events",
            "logId": util_default.uuid(),
            "metricDuration": Math.floor(Math.random() * 1e3),
            "status": "200"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 200 + Math.floor(Math.random() * 1e3),
          "event_name": "createSessionAndStartCompletion",
          "event_message": "\u5F00\u59CB\u521B\u5EFA\u5BF9\u8BDD",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "__referrer": "",
            "agentId": "chat",
            "thinkingEnabled": false
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 300 + Math.floor(Math.random() * 1e3),
          "event_name": "__httpRequest",
          "event_message": "httpRequest POST /api/v0/chat_session/create",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "__referrer": "",
            "url": "/api/v0/chat_session/create",
            "path": "/api/v0/chat_session/create",
            "method": "POST"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 400 + Math.floor(Math.random() * 1e3),
          "event_name": "__httpResponse",
          "event_message": `httpResponse POST /api/v0/chat_session/create, ${Math.floor(Math.random() * 1e3)}ms, reason: none`,
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "url": "/api/v0/chat_session/create",
            "path": "/api/v0/chat_session/create",
            "method": "POST",
            "metricDuration": Math.floor(Math.random() * 1e3),
            "status": "200",
            "logId": util_default.uuid()
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 500 + Math.floor(Math.random() * 1e3),
          "event_name": "__log",
          "event_message": "\u4F7F\u7528 buffer \u6A21\u5F0F",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": ""
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 600 + Math.floor(Math.random() * 1e3),
          "event_name": "chatCompletionApi",
          "event_message": "chatCompletionApi \u88AB\u8C03\u7528",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "scene": "completion",
            "chatSessionId": refConvId,
            "withFile": "false",
            "thinkingEnabled": "false"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 700 + Math.floor(Math.random() * 1e3),
          "event_name": "__httpRequest",
          "event_message": "httpRequest POST /api/v0/chat/completion",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "url": "/api/v0/chat/completion",
            "path": "/api/v0/chat/completion",
            "method": "POST"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 800 + Math.floor(Math.random() * 1e3),
          "event_name": "completionFirstChunkReceived",
          "event_message": "\u6536\u5230\u7B2C\u4E00\u4E2A completion chunk\uFF08\u53EF\u4EE5\u662F\u7A7A chunk\uFF09",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "metricDuration": Math.floor(Math.random() * 1e3),
            "logId": util_default.uuid()
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 900 + Math.floor(Math.random() * 1e3),
          "event_name": "createSessionAndStartCompletion",
          "event_message": "\u521B\u5EFA\u4F1A\u8BDD\u5E76\u5F00\u59CB\u8865\u5168",
          "payload": {
            "__location": "https://chat.deepseek.com/",
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "agentId": "chat",
            "newSessionId": refConvId,
            "isCreateNewChat": "false",
            "thinkingEnabled": "false"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 1e3 + Math.floor(Math.random() * 1e3),
          "event_name": "routeChange",
          "event_message": `\u8DEF\u7531\u6539\u53D8 => /a/chat/s/${refConvId}`,
          "payload": {
            "__location": `https://chat.deepseek.com/a/chat/s/${refConvId}`,
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "to": `/a/chat/s/${refConvId}`,
            "redirect": "false",
            "redirected": "false",
            "redirectReason": "",
            "redirectTo": "/",
            "hasToken": "true",
            "hasUserInfo": "true"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 1100 + Math.floor(Math.random() * 1e3),
          "event_name": "__pageVisit",
          "event_message": `\u8BBF\u95EE\u9875\u9762 [/a/chat/s/${refConvId}] [0]\uFF1A${fakeDuration1}ms`,
          "payload": {
            "__location": `https://chat.deepseek.com/a/chat/s/${refConvId}`,
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "pathname": `/a/chat/s/${refConvId}`,
            "metricVisitIndex": 0,
            "metricDuration": fakeDuration1,
            "referrer": "none",
            "appTheme": "light"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 1200 + Math.floor(Math.random() * 1e3),
          "event_name": "__tti",
          "event_message": `/a/chat/s/${refConvId} TTI \u4E0A\u62A5\uFF1A${fakeDuration2}ms`,
          "payload": {
            "__location": `https://chat.deepseek.com/a/chat/s/${refConvId}`,
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "type": "warmStart",
            "referer": "",
            "metricDuration": fakeDuration2,
            "metricVisitIndex": 0,
            "metricDurationSinceMounted": 0,
            "hasError": "false"
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 1300 + Math.floor(Math.random() * 1e3),
          "event_name": "__httpResponse",
          "event_message": `httpResponse POST /api/v0/chat/completion, ${fakeDuration3}ms, reason: none`,
          "payload": {
            "__location": `https://chat.deepseek.com/a/chat/s/${refConvId}`,
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "url": "/api/v0/chat/completion",
            "path": "/api/v0/chat/completion",
            "method": "POST",
            "metricDuration": fakeDuration3,
            "status": "200",
            "logId": util_default.uuid()
          },
          "level": "info"
        },
        {
          "session_id": sessionId,
          "client_timestamp_ms": timestamp + 1400 + Math.floor(Math.floor(Math.random() * 1e3)),
          "event_name": "completionApiOk",
          "event_message": "\u5B8C\u6210\u54CD\u5E94\uFF0C\u54CD\u5E94\u6709\u6B63\u5E38\u7684\u7684 finish reason",
          "payload": {
            "__location": `https://chat.deepseek.com/a/chat/s/${refConvId}`,
            "__ip": ipAddress2,
            "__region": "CN",
            "__pageVisibility": "true",
            "__nodeEnv": "production",
            "__deployEnv": "production",
            "__appVersion": FAKE_HEADERS["X-App-Version"],
            "__commitId": EVENT_COMMIT_ID,
            "__userAgent": FAKE_HEADERS["User-Agent"],
            "__referrer": "",
            "condition": "hasDone",
            "streamClosed": false,
            "scene": "completion",
            "chatSessionId": refConvId
          },
          "level": "info"
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...FAKE_HEADERS,
        Referer: `https://chat.deepseek.com/a/chat/s/${refConvId}`,
        Cookie: generateCookie()
      },
      validateStatus: () => true
    });
    checkResult(response, refreshToken);
    logger_default.info("\u53D1\u9001\u4E8B\u4EF6\u6210\u529F");
  } catch (err) {
    logger_default.error(err);
  }
}
async function getThinkingQuota(refreshToken) {
  try {
    const response = await axios2.get("https://chat.deepseek.com/api/v0/users/feature_quota", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        ...FAKE_HEADERS,
        Cookie: generateCookie()
      },
      timeout: 15e3,
      validateStatus: () => true
    });
    const { biz_data } = checkResult(response, refreshToken);
    if (!biz_data) return 0;
    const { quota, used } = biz_data.thinking;
    if (!_13.isFinite(quota) || !_13.isFinite(used)) return 0;
    logger_default.info(`\u83B7\u53D6\u6DF1\u5EA6\u601D\u8003\u914D\u989D: ${quota}/${used}`);
    return quota - used;
  } catch (err) {
    logger_default.error("\u83B7\u53D6\u6DF1\u5EA6\u601D\u8003\u914D\u989D\u5931\u8D25:", err);
    return 0;
  }
}
async function fetchLatestVersion() {
  try {
    logger_default.info("\u6B63\u5728\u4ECE\u5B98\u7F51\u81EA\u52A8\u83B7\u53D6\u6700\u65B0\u7248\u672C\u4FE1\u606F...");
    const response = await axios2.get("https://chat.deepseek.com/", {
      timeout: 1e4,
      headers: { ...FAKE_HEADERS },
      validateStatus: () => true
    });
    if (response.status !== 200 || !response.data) {
      logger_default.warn(`\u83B7\u53D6\u5B98\u7F51\u9996\u9875\u5931\u8D25, \u72B6\u6001\u7801: ${response.status}`);
      return EVENT_COMMIT_ID;
    }
    const html = response.data.toString();
    const commitIdMatch = html.match(/<meta name="commit-id" content="(.*?)">/);
    if (commitIdMatch && commitIdMatch[1]) {
      EVENT_COMMIT_ID = commitIdMatch[1];
      logger_default.success(`\u83B7\u53D6 Commit ID \u6210\u529F: ${EVENT_COMMIT_ID}`);
    }
    const jsUrlMatch = html.match(/src="([^"]*?main\.[a-z0-9]+\.js)"/i);
    if (jsUrlMatch && jsUrlMatch[1]) {
      let jsUrl = jsUrlMatch[1];
      if (!jsUrl.startsWith("http")) {
        jsUrl = `https://chat.deepseek.com${jsUrl}`;
      }
      logger_default.info(`\u53D1\u73B0\u4E3B JS \u6587\u4EF6: ${jsUrl}`);
      const jsResponse = await axios2.get(jsUrl, { timeout: 15e3 }).catch((e) => {
        logger_default.error(`\u6293\u53D6 JS \u6587\u4EF6\u5931\u8D25: ${e.message}`);
        return null;
      });
      if (jsResponse && jsResponse.data) {
        const jsContent = jsResponse.data.toString();
        logger_default.info(`\u6210\u529F\u8BFB\u53D6 JS \u6587\u4EF6, \u957F\u5EA6: ${jsContent.length}`);
        let appVersion = "";
        const appVersionDirectMatch = jsContent.match(/appVersion\s*:\s*["'](.*?)["']/i);
        if (appVersionDirectMatch && appVersionDirectMatch[1]) {
          appVersion = appVersionDirectMatch[1];
        } else {
          const varMatch = jsContent.match(/appVersion\s*:\s*([a-zA-Z0-9_$]+)/i);
          if (varMatch && varMatch[1]) {
            const varName = varMatch[1];
            const valMatch = jsContent.match(new RegExp(`(?:let|var|const)\\s+${varName}\\s*=\\s*["'](.*?)["']`));
            if (valMatch && valMatch[1]) {
              appVersion = valMatch[1];
            }
          }
        }
        if (appVersion) {
          FAKE_HEADERS["X-App-Version"] = appVersion;
          logger_default.success(`\u83B7\u53D6 X-App-Version \u6210\u529F: ${FAKE_HEADERS["X-App-Version"]}`);
        } else {
          const fallbackMatch = jsContent.match(/Version\s*[:=]\s*["'](\d+\.\d+\.\d+)["']/i);
          if (fallbackMatch && fallbackMatch[1]) {
            FAKE_HEADERS["X-App-Version"] = fallbackMatch[1];
            logger_default.success(`\u83B7\u53D6 X-App-Version (\u515C\u5E95) \u6210\u529F: ${FAKE_HEADERS["X-App-Version"]}`);
          } else {
            FAKE_HEADERS["X-App-Version"] = "2.0.0";
            logger_default.warn("\u672A\u80FD\u4ECE JS \u4E2D\u627E\u5230 AppVersion, \u4F7F\u7528\u9ED8\u8BA4\u503C 2.0.0");
          }
        }
        let clientVersion = "";
        const clientVersionDirectMatch = jsContent.match(/clientVersion\s*:\s*["'](.*?)["']/i) || jsContent.match(/version\s*:\s*["'](\d+\.\d+\.\d+)["']/i);
        if (clientVersionDirectMatch && clientVersionDirectMatch[1]) {
          clientVersion = clientVersionDirectMatch[1];
        } else {
          const varMatch = jsContent.match(/version\s*:\s*([a-zA-Z0-9_$]+)/i);
          if (varMatch && varMatch[1]) {
            const varName = varMatch[1];
            const valMatch = jsContent.match(new RegExp(`(?:let|var|const)\\s+${varName}\\s*=\\s*["'](.*?)["']`));
            if (valMatch && valMatch[1]) {
              clientVersion = valMatch[1];
            }
          }
        }
        if (clientVersion) {
          FAKE_HEADERS["X-Client-Version"] = clientVersion;
          logger_default.success(`\u83B7\u53D6 X-Client-Version \u6210\u529F: ${FAKE_HEADERS["X-Client-Version"]}`);
        } else {
          FAKE_HEADERS["X-Client-Version"] = FAKE_HEADERS["X-App-Version"];
          logger_default.info(`X-Client-Version \u5DF2\u81EA\u52A8\u540C\u6B65\u4E3A AppVersion: ${FAKE_HEADERS["X-Client-Version"]}`);
        }
      }
    }
  } catch (err) {
    logger_default.error("\u81EA\u52A8\u8865\u5168\u7248\u672C\u4FE1\u606F\u5931\u8D25:", err.message);
  }
  return EVENT_COMMIT_ID;
}
function autoUpdateVersion() {
  fetchLatestVersion();
}
util_default.createCronJob("0 0 */6 * * *", autoUpdateVersion).start();
getIPAddress().then(() => {
  autoUpdateVersion();
}).catch((err) => {
  logger_default.error("\u83B7\u53D6 IP \u5730\u5740\u5931\u8D25:", err);
});
var chat_default = {
  createCompletion,
  createCompletionStream,
  regenerateCompletion,
  getTokenLiveStatus,
  tokenSplit,
  fetchAppVersion: fetchLatestVersion
};

// src/api/routes/chat.ts
import process2 from "process";

// src/lib/storage.ts
import Database from "better-sqlite3";
import path7 from "path";
import fs8 from "fs-extra";
var SQLiteStorage = class {
  db;
  MAX_ENTRIES = 1e4;
  // 🌟 限制最大条目数
  constructor() {
    const dbPath = path7.join(process.cwd(), "data", "sessions.db");
    fs8.ensureDirSync(path7.dirname(dbPath));
    this.db = new Database(dbPath);
    this.init();
  }
  init() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS kv_config (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at INTEGER
            )
        `);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_updated_at ON kv_config(updated_at)`);
    logger_default.info("[STORAGE] SQLite database initialized (better-sqlite3).");
  }
  get(key) {
    const row = this.db.prepare("SELECT value FROM kv_config WHERE key = ?").get(key);
    if (row) {
      try {
        return JSON.parse(row.value);
      } catch {
        return row.value;
      }
    }
    return void 0;
  }
  set(key, value) {
    const valStr = typeof value === "string" ? value : JSON.stringify(value);
    const now = Date.now();
    const count = this.db.prepare("SELECT COUNT(*) as count FROM kv_config").get().count;
    if (count >= this.MAX_ENTRIES) {
      this.db.prepare("DELETE FROM kv_config WHERE key IN (SELECT key FROM kv_config ORDER BY updated_at ASC LIMIT 100)").run();
    }
    this.db.prepare("INSERT OR REPLACE INTO kv_config (key, value, updated_at) VALUES (?, ?, ?)").run(key, valStr, now);
  }
  has(key) {
    const row = this.db.prepare("SELECT 1 FROM kv_config WHERE key = ?").get(key);
    return !!row;
  }
  delete(key) {
    this.db.prepare("DELETE FROM kv_config WHERE key = ?").run(key);
  }
  cleanup(ttlMs) {
    const threshold = Date.now() - ttlMs;
    const result = this.db.prepare(`
                        DELETE FROM kv_config
                        WHERE updated_at < ?
                            AND (
                                key LIKE 'session:%'
                                OR key LIKE 'chat:%'
                                OR key LIKE 'messages:%'
                                OR key LIKE 'responses:%'
                            )
                `).run(threshold);
    if (result.changes > 0) {
      logger_default.info(`[STORAGE] Cleaned up ${result.changes} expired sessions.`);
      this.db.exec("VACUUM");
    }
  }
};
var storage = new SQLiteStorage();
var storage_default = storage;

// src/lib/agent-session.ts
import _14 from "lodash";
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
function getHeader(request, name) {
  return _14.get(request.headers, name.toLowerCase()) || _14.get(request.headers, name);
}
function getClientIdentity(request) {
  const explicitClientId = getHeader(request, "x-client-id") || getHeader(request, "x-newapi-user") || getHeader(request, "x-newapi-token");
  const authorization = String(getHeader(request, "authorization") || "");
  return String(explicitClientId || `auth_${hashString(authorization)}`);
}
function getExplicitSessionId(request) {
  const sessionId = getHeader(request, "x-session-id") || getHeader(request, "x-newapi-session");
  return sessionId ? String(sessionId) : "";
}
function tokenFingerprint(token) {
  const rawToken = String(token || "").replace(/^Bearer\s+/i, "").trim();
  return rawToken ? hashString(rawToken).slice(0, 12) : "none";
}
function buildSessionPrefix(request, endpoint, model, token) {
  const clientId = getClientIdentity(request);
  return `${endpoint}:${clientId}:acct_${tokenFingerprint(token)}:${model}`;
}
function selectTokenForSession(tokens, seed) {
  const availableTokens = (_14.isArray(tokens) ? tokens : []).filter(_14.isString).map((token) => token.trim()).filter(Boolean);
  if (availableTokens.length === 0) return "";
  if (availableTokens.length === 1) return availableTokens[0];
  const index = parseInt(hashString(seed).slice(0, 8), 16) % availableTokens.length;
  return availableTokens[index];
}

// src/lib/tool-calls.ts
import _15 from "lodash";
var TOOL_START_MARKERS = [
  "<tool_call",
  "<\uFF5CDSML\uFF5Ctool_calls>",
  "\uFF5CDSML\uFF5Ctool_calls>",
  "```json",
  "<bash>",
  "<bash ",
  "<bash_notool>",
  "<bash-command",
  "<bash-tool-usage>",
  "<bash_script",
  "<command-line",
  "<tool_calls>",
  "<function_calls>",
  "<function ",
  "<invoke ",
  "Assistant requested tool",
  '{"tool_call"',
  '{"function_call"',
  '{"custom_tool_call"',
  '{"custom_tool_calls"',
  '{"mcp_tool_call"',
  '{"mcp_tool_calls"'
];
var ASSISTANT_MARKER_PATTERN = /(?:^|\n)\s*<｜Assistant｜>\s*/g;
var PARAMETER_PATTERN = /<parameter\s+name=["']([^"']+)["'](?:\s+[^>]*)?>([\s\S]*?)<\/parameter>/gi;
function safeJsonStringify(value) {
  const result = _15.attempt(() => JSON.stringify(value));
  return _15.isError(result) ? "{}" : String(result || "{}");
}
function normalizeArgs(args) {
  if (_15.isPlainObject(args)) return args;
  if (_15.isArray(args)) return { input: args };
  if (_15.isNil(args)) return {};
  return { input: args };
}
function getAvailableToolNames(tools) {
  if (!_15.isArray(tools)) return [];
  return tools.map((tool) => _15.get(tool, "name") || _15.get(tool, "function.name")).filter(_15.isString);
}
function normalizeToolName(name) {
  return String(name || "").replace(/([a-z])([A-Z])/g, "$1_$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}
function getToolByName(tools, name) {
  const normalized = normalizeToolName(name);
  return (_15.isArray(tools) ? tools : []).find((tool) => {
    const toolName = _15.get(tool, "name") || _15.get(tool, "function.name");
    return _15.isString(toolName) && normalizeToolName(toolName) === normalized;
  });
}
function getToolParameters(tool) {
  return _15.get(tool, "parameters") || _15.get(tool, "function.parameters") || _15.get(tool, "input_schema") || _15.get(tool, "inputSchema") || {};
}
function firstParameterName(parameters) {
  return Object.keys(_15.get(parameters, "properties") || {})[0];
}
function shellCommandToArgs(command) {
  if (_15.isArray(command)) return command.map(String);
  const commandText = String(command || "").trim();
  if (!commandText) return [];
  return process.platform === "win32" ? ["powershell.exe", "-Command", commandText] : ["/bin/sh", "-c", commandText];
}
function adaptToolArgs(tool, args) {
  const parameters = getToolParameters(tool);
  const properties = _15.get(parameters, "properties") || {};
  const parameterName = firstParameterName(parameters);
  if (!parameterName) return args;
  const command = args.command ?? args.cmd ?? args.path;
  if (_15.get(properties, `${parameterName}.type`) === "array" && command != null)
    return { [parameterName]: shellCommandToArgs(command) };
  if (parameterName !== "command" && command != null)
    return { [parameterName]: _15.isArray(command) ? command.join(" ") : String(command) };
  const keys = Object.keys(args);
  if (keys.length === 1 && keys[0] === "input" && parameterName !== "input")
    return { [parameterName]: args.input };
  return args;
}
function createToolNameResolver(tools = []) {
  const toolNames = getAvailableToolNames(tools);
  const hasTool = (name) => Boolean(getToolByName(tools, name));
  const resolveAvailableName = (name) => {
    const tool = getToolByName(tools, name);
    return _15.get(tool, "name") || _15.get(tool, "function.name") || name;
  };
  const shellTool = ["shell", "bash", "run_shell_command", "powershell", "run_shell"].find(hasTool) || toolNames[0] || "shell";
  return (name, args = {}) => {
    if (hasTool(name)) {
      const resolvedName = resolveAvailableName(name);
      return { name: resolvedName, args: adaptToolArgs(getToolByName(tools, resolvedName), args) };
    }
    if (["run_shell_command", "run_shell", "shell", "bash", "powershell"].includes(normalizeToolName(name)))
      return { name: shellTool, args: adaptToolArgs(getToolByName(tools, shellTool), args) };
    if (name === "read_file") {
      const filePath = args.path || args.file || args.filename;
      if (hasTool("read_file")) return { name: resolveAvailableName("read_file"), args };
      return {
        name: shellTool,
        args: adaptToolArgs(getToolByName(tools, shellTool), { command: `cat ${JSON.stringify(filePath || "")}` })
      };
    }
    if (name === "apply_patch" && hasTool("apply_patch")) return { name: resolveAvailableName("apply_patch"), args };
    return { name, args };
  };
}
function createToolCall(name, args, resolveToolName, range) {
  const resolved = resolveToolName(name, normalizeArgs(args));
  const input = normalizeArgs(resolved.args);
  return {
    id: `fc_${util_default.uuid(false)}`,
    call_id: `call_${util_default.uuid(false)}`,
    name: resolved.name,
    input,
    arguments: safeJsonStringify(input),
    range
  };
}
function parseParameterTags(value) {
  const args = {};
  const parameterPattern = new RegExp(PARAMETER_PATTERN);
  let parameterMatch;
  while ((parameterMatch = parameterPattern.exec(value)) != null) {
    args[parameterMatch[1]] = util_default.decodeXmlText(parameterMatch[2].trim());
  }
  return args;
}
function parseDsmlParameterTags(value) {
  const args = {};
  const parameterPattern = /<?｜DSML｜parameter\s+name=["']([^"']+)["'](?:\s+[^>]*)?>([\s\S]*?)<\/｜DSML｜parameter>/gi;
  let parameterMatch;
  while ((parameterMatch = parameterPattern.exec(value)) != null) {
    args[parameterMatch[1]] = util_default.decodeXmlText(parameterMatch[2].trim());
  }
  return args;
}
function parseToolInputFromBody(body) {
  const decoded = util_default.decodeXmlText(String(body || "").trim());
  const parameterArgs = parseParameterTags(decoded);
  if (!_15.isEmpty(parameterArgs)) return parameterArgs;
  const dsmlArgs = parseDsmlParameterTags(decoded);
  if (!_15.isEmpty(dsmlArgs)) return dsmlArgs;
  const jsonStart = decoded.indexOf("{");
  if (jsonStart !== -1) {
    const jsonEnd = util_default.findJsonEnd(decoded, jsonStart);
    if (jsonEnd !== -1) return util_default.parseToolInput(decoded.slice(jsonStart, jsonEnd));
  }
  return util_default.parseToolInput(decoded);
}
function parseStandardToolCalls(text, resolveToolName) {
  const calls = [];
  const openPattern = /<?tool_call\s+name=["']([^"']+)["']\s*>/gi;
  let match;
  while ((match = openPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const afterOpen = openPattern.lastIndex;
    const closePattern = /<\/tool_call>/gi;
    closePattern.lastIndex = afterOpen;
    const closeMatch = closePattern.exec(text);
    let body;
    let end;
    if (closeMatch) {
      body = text.slice(afterOpen, closeMatch.index);
      end = closeMatch.index + closeMatch[0].length;
    } else {
      const bodyRaw = text.slice(afterOpen);
      const jsonStart = bodyRaw.indexOf("{");
      if (jsonStart !== -1) {
        const jsonEnd = util_default.findJsonEnd(bodyRaw, jsonStart);
        if (jsonEnd !== -1) {
          body = bodyRaw.slice(0, jsonEnd);
          end = afterOpen + jsonEnd;
        } else {
          body = bodyRaw;
          end = text.length;
        }
      } else {
        body = bodyRaw;
        end = text.length;
      }
    }
    calls.push(createToolCall(match[1], parseToolInputFromBody(body), resolveToolName, [match.index, end]));
    openPattern.lastIndex = end;
  }
  return calls;
}
function parseDsmlToolCalls(text, resolveToolName) {
  if (!text.includes("\uFF5CDSML\uFF5Ctool_calls")) return [];
  const calls = [];
  const invokePattern = /<?｜DSML｜invoke\s+name=["']([^"']+)["']\s*>([\s\S]*?)<\/｜DSML｜invoke>/gi;
  let invokeMatch;
  while ((invokeMatch = invokePattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, invokeMatch.index)) continue;
    calls.push(createToolCall(invokeMatch[1], parseToolInputFromBody(invokeMatch[2]), resolveToolName, [invokeMatch.index, invokePattern.lastIndex]));
  }
  return calls;
}
function parseBashArgs(value) {
  const argPattern = /<arg>\s*([\s\S]*?)\s*<\/arg>/g;
  const args = [];
  let argMatch;
  while ((argMatch = argPattern.exec(value)) != null) {
    const decoded2 = util_default.decodeXmlText(argMatch[1].trim());
    const parsed2 = _15.attempt(() => JSON.parse(decoded2));
    if (_15.isArray(parsed2)) args.push(...parsed2.map(String));
    else if (decoded2) args.push(decoded2);
  }
  if (args.length) return args;
  const decoded = util_default.decodeXmlText(value.trim());
  const parsed = _15.attempt(() => JSON.parse(decoded));
  if (_15.isArray(parsed)) return parsed.map(String);
  return decoded;
}
function parseCommandTag(text, tagName, resolveToolName) {
  const calls = [];
  const tagPattern = new RegExp(`^\\s*<${tagName}(?:\\s+[^>]*)?>\\s*\\r?\\n?([\\s\\S]*?)\\r?\\n?\\s*<\\/${tagName}>`, "gmi");
  let match;
  while ((match = tagPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const command = parseBashArgs(match[1]);
    if (!command) continue;
    calls.push(createToolCall("shell", { command }, resolveToolName, [match.index, tagPattern.lastIndex]));
  }
  return calls;
}
function parseBashScriptCalls(text, resolveToolName) {
  var _a4, _b4;
  const calls = [];
  const scriptPattern = /^\s*<bash_script(?:\s+[^>]*)?>([\s\S]*?)<\/bash_script>/gmi;
  let match;
  while ((match = scriptPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const body = match[1];
    const value = (_a4 = body.match(/<value>\s*([\s\S]*?)\s*<\/value>/)) == null ? void 0 : _a4[1];
    const invocation = (_b4 = body.match(/<invocation>\s*([\s\S]*?)\s*<\/invocation>/)) == null ? void 0 : _b4[1];
    const command = util_default.decodeXmlText((value || invocation || body).trim());
    if (!command) continue;
    calls.push(createToolCall("shell", { command }, resolveToolName, [match.index, scriptPattern.lastIndex]));
  }
  return calls;
}
function parseInvokeCalls(text, resolveToolName) {
  const calls = [];
  const invokePattern = /<invoke\s+name=["']([^"']+)["']\s*>([\s\S]*?)<\/invoke>/gi;
  let invokeMatch;
  while ((invokeMatch = invokePattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, invokeMatch.index)) continue;
    calls.push(createToolCall(invokeMatch[1], parseToolInputFromBody(invokeMatch[2]), resolveToolName, [invokeMatch.index, invokePattern.lastIndex]));
  }
  return calls;
}
function parseBareFunctionTags(text, resolveToolName) {
  const calls = [];
  const functionPattern = /<function\s+name=["']([^"']+)["']\s*>([\s\S]*?)<\/function>/gi;
  let functionMatch;
  while ((functionMatch = functionPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, functionMatch.index)) continue;
    calls.push(createToolCall(functionMatch[1], parseToolInputFromBody(functionMatch[2]), resolveToolName, [functionMatch.index, functionPattern.lastIndex]));
  }
  return calls;
}
function parseOpenAIXmlFunctionCalls(text, resolveToolName) {
  var _a4, _b4, _c;
  const calls = [];
  const functionPattern = /<function\s+[^>]*>([\s\S]*?)<\/function>/gi;
  let functionMatch;
  while ((functionMatch = functionPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, functionMatch.index)) continue;
    const body = functionMatch[1];
    const name = (_b4 = (_a4 = body.match(/<function_name>\s*([\s\S]*?)\s*<\/function_name>/)) == null ? void 0 : _a4[1]) == null ? void 0 : _b4.trim();
    const argsText = (_c = body.match(/<function_args>\s*([\s\S]*?)\s*<\/function_args>/)) == null ? void 0 : _c[1];
    if (!name || argsText == null) continue;
    calls.push(createToolCall(name, parseToolInputFromBody(argsText), resolveToolName, [functionMatch.index, functionPattern.lastIndex]));
  }
  return calls;
}
function parseRequestedToolCalls(text, resolveToolName) {
  const calls = [];
  const requestedToolPattern = /Assistant requested tool\s+([A-Za-z0-9_\-.]+)\s*:/gi;
  let match;
  while ((match = requestedToolPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const jsonStart = text.indexOf("{", requestedToolPattern.lastIndex);
    if (jsonStart === -1) continue;
    const jsonEnd = util_default.findJsonEnd(text, jsonStart);
    if (jsonEnd === -1) continue;
    calls.push(createToolCall(match[1], util_default.parseToolInput(text.slice(jsonStart, jsonEnd)), resolveToolName, [match.index, jsonEnd]));
  }
  return calls;
}
function parseFunctionInvocationCalls(text, resolveToolName) {
  const calls = [];
  const functionCallPattern = /(?:^|\n)\s*([A-Za-z][A-Za-z0-9_\-.]*)\s*\(/g;
  let match;
  while ((match = functionCallPattern.exec(text)) != null) {
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const jsonStart = text.indexOf("{", functionCallPattern.lastIndex);
    if (jsonStart === -1) continue;
    const prefixBetweenNameAndJson = text.slice(functionCallPattern.lastIndex, jsonStart).trim();
    if (prefixBetweenNameAndJson) continue;
    const jsonEnd = util_default.findJsonEnd(text, jsonStart);
    if (jsonEnd === -1) continue;
    const suffix = text.slice(jsonEnd).match(/^\s*\)/);
    if (!suffix) continue;
    calls.push(createToolCall(match[1], util_default.parseToolInput(text.slice(jsonStart, jsonEnd)), resolveToolName, [match.index, jsonEnd + suffix[0].length]));
  }
  return calls;
}
function normalizeJsonArgs(value) {
  if (_15.isPlainObject(value)) return value;
  if (_15.isString(value)) return util_default.parseToolInput(value);
  if (_15.isArray(value)) return { input: value };
  if (_15.isNil(value)) return {};
  return { input: value };
}
function collectJsonToolSpecs(payload) {
  const specs = [];
  const payloads = _15.isArray(payload) ? payload : [payload];
  const append = (name, args) => {
    if (!_15.isString(name) || !name.trim()) return;
    specs.push({ name: name.trim(), args: normalizeJsonArgs(args) });
  };
  for (const entry of payloads) {
    if (!_15.isPlainObject(entry)) continue;
    const toolCall = _15.get(entry, "tool_call");
    if (_15.isPlainObject(toolCall))
      append(_15.get(toolCall, "name") || _15.get(toolCall, "function.name"), _15.get(toolCall, "arguments") ?? _15.get(toolCall, "input") ?? _15.get(toolCall, "params") ?? _15.get(toolCall, "function.arguments"));
    const functionCall = _15.get(entry, "function_call");
    if (_15.isPlainObject(functionCall))
      append(_15.get(functionCall, "name"), _15.get(functionCall, "arguments") ?? _15.get(functionCall, "input") ?? _15.get(functionCall, "params"));
    const customToolCall = _15.get(entry, "custom_tool_call");
    if (_15.isPlainObject(customToolCall))
      append(_15.get(customToolCall, "name") || _15.get(customToolCall, "tool"), _15.get(customToolCall, "arguments") ?? _15.get(customToolCall, "input") ?? _15.get(customToolCall, "params"));
    const mcpToolCall = _15.get(entry, "mcp_tool_call");
    if (_15.isPlainObject(mcpToolCall))
      append(_15.get(mcpToolCall, "tool") || _15.get(mcpToolCall, "name"), _15.get(mcpToolCall, "arguments") ?? _15.get(mcpToolCall, "input") ?? _15.get(mcpToolCall, "params"));
    const toolCalls = _15.get(entry, "tool_calls");
    if (_15.isArray(toolCalls)) {
      for (const call of toolCalls) {
        const name = _15.get(call, "name") || _15.get(call, "function.name");
        const args = _15.get(call, "arguments") ?? _15.get(call, "input") ?? _15.get(call, "params") ?? _15.get(call, "function.arguments");
        append(name, args);
      }
    }
    const customToolCalls = _15.get(entry, "custom_tool_calls");
    if (_15.isArray(customToolCalls)) {
      for (const call of customToolCalls) {
        const name = _15.get(call, "name") || _15.get(call, "tool");
        const args = _15.get(call, "arguments") ?? _15.get(call, "input") ?? _15.get(call, "params");
        append(name, args);
      }
    }
    const mcpToolCalls = _15.get(entry, "mcp_tool_calls");
    if (_15.isArray(mcpToolCalls)) {
      for (const call of mcpToolCalls) {
        const name = _15.get(call, "tool") || _15.get(call, "name");
        const args = _15.get(call, "arguments") ?? _15.get(call, "input") ?? _15.get(call, "params");
        append(name, args);
      }
    }
    if (_15.isString(_15.get(entry, "name"))) {
      if (_15.has(entry, "arguments") || _15.has(entry, "input") || _15.has(entry, "params")) {
        append(_15.get(entry, "name"), _15.get(entry, "arguments") ?? _15.get(entry, "input") ?? _15.get(entry, "params"));
      } else {
        const directArgs = _15.omit(entry, ["name", "type", "id"]);
        if (!_15.isEmpty(directArgs)) append(_15.get(entry, "name"), directArgs);
      }
    }
    if (_15.isString(_15.get(entry, "tool")) && (_15.has(entry, "arguments") || _15.has(entry, "input") || _15.has(entry, "params")))
      append(_15.get(entry, "tool"), _15.get(entry, "arguments") ?? _15.get(entry, "input") ?? _15.get(entry, "params"));
  }
  return specs;
}
function parseJsonPayloadToolCalls(payload, resolveToolName, range) {
  const calls = [];
  for (const spec of collectJsonToolSpecs(payload)) {
    calls.push(createToolCall(spec.name, spec.args, resolveToolName, range));
  }
  return calls;
}
function parseJsonEnvelopeToolCalls(text, resolveToolName) {
  const calls = [];
  const source = text.trimStart();
  if (!source.startsWith("{") && !source.startsWith("[")) return calls;
  const firstBrace = text.search(/[\[{]/);
  if (firstBrace === -1 || util_default.isInsideMarkdownFence(text, firstBrace)) return calls;
  const jsonEnd = text[firstBrace] === "[" ? text.lastIndexOf("]") + 1 : util_default.findJsonEnd(text, firstBrace);
  if (jsonEnd === -1) return calls;
  const parsed = _15.attempt(() => JSON.parse(text.slice(firstBrace, jsonEnd)));
  if (_15.isError(parsed) || !_15.isPlainObject(parsed) && !_15.isArray(parsed)) return calls;
  calls.push(...parseJsonPayloadToolCalls(parsed, resolveToolName, [firstBrace, jsonEnd]));
  return calls;
}
function parseJsonFenceToolCalls(text, resolveToolName) {
  const calls = [];
  const fencePattern = /```(?:json)?[ \t]*\r?\n([\s\S]*?)```/gi;
  let match;
  while ((match = fencePattern.exec(text)) != null) {
    const body = match[1].trim();
    if (!body || body[0] !== "{" && body[0] !== "[") continue;
    if (util_default.isInsideMarkdownFence(text, match.index)) continue;
    const parsed = _15.attempt(() => JSON.parse(body));
    if (_15.isError(parsed) || !_15.isPlainObject(parsed) && !_15.isArray(parsed)) continue;
    const range = [match.index, fencePattern.lastIndex];
    calls.push(...parseJsonPayloadToolCalls(parsed, resolveToolName, range));
  }
  return calls;
}
function dedupeToolCalls(calls) {
  const seen = /* @__PURE__ */ new Set();
  return calls.filter((call) => {
    var _a4;
    const key = `${((_a4 = call.range) == null ? void 0 : _a4.join(":")) || ""}:${call.name}:${call.arguments}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function cleanAssistantArtifacts(text) {
  return String(text || "").replace(ASSISTANT_MARKER_PATTERN, "\n");
}
function parseAgentToolCalls(text, toolsOrResolver) {
  const resolveToolName = _15.isFunction(toolsOrResolver) ? toolsOrResolver : createToolNameResolver(toolsOrResolver || []);
  const source = cleanAssistantArtifacts(text);
  return dedupeToolCalls([
    ...parseStandardToolCalls(source, resolveToolName),
    ...parseDsmlToolCalls(source, resolveToolName),
    ...parseCommandTag(source, "bash", resolveToolName),
    ...parseCommandTag(source, "bash_notool", resolveToolName),
    ...parseCommandTag(source, "bash-command", resolveToolName),
    ...parseCommandTag(source, "bash-tool-usage", resolveToolName),
    ...parseBashScriptCalls(source, resolveToolName),
    ...parseCommandTag(source, "command-line", resolveToolName),
    ...parseInvokeCalls(source, resolveToolName),
    ...parseBareFunctionTags(source, resolveToolName),
    ...parseOpenAIXmlFunctionCalls(source, resolveToolName),
    ...parseRequestedToolCalls(source, resolveToolName),
    ...parseFunctionInvocationCalls(source, resolveToolName),
    ...parseJsonFenceToolCalls(source, resolveToolName),
    ...parseJsonEnvelopeToolCalls(source, resolveToolName)
  ]);
}
function splitTextAndToolCalls(text, toolsOrResolver) {
  let cleanText = cleanAssistantArtifacts(text);
  const toolCalls = parseAgentToolCalls(cleanText, toolsOrResolver);
  const ranges = toolCalls.map((call) => call.range).filter(Boolean);
  for (const [start, end] of ranges.sort((left, right) => right[0] - left[0])) {
    cleanText = cleanText.slice(0, start) + cleanText.slice(end);
  }
  return { text: cleanText.trim(), toolCalls };
}
function findLineStartTag(text, pattern) {
  let match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) != null) {
    if (!util_default.isInsideMarkdownFence(text, match.index)) return match.index;
  }
  return -1;
}
function findPatternStart(text, pattern) {
  let match;
  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) != null) {
    if (!util_default.isInsideMarkdownFence(text, match.index)) return match.index;
  }
  return -1;
}
function findTrailingMarkerPrefixStart(text, marker, minimumLength = 8) {
  const maxLength = Math.min(marker.length, text.length);
  const minLength = Math.min(minimumLength, marker.length);
  for (let length = maxLength; length >= minLength; length--) {
    const start = text.length - length;
    if (util_default.isInsideMarkdownFence(text, start)) continue;
    const suffix = text.slice(start);
    if (marker.startsWith(suffix)) return start;
  }
  return -1;
}
function findJsonFenceToolStart(text) {
  const fencePattern = /```(?:json)?[ \t]*\r?\n([\s\S]*?)```/gi;
  let match;
  while ((match = fencePattern.exec(text)) != null) {
    const body = match[1].trim();
    if (!body || body[0] !== "{" && body[0] !== "[") continue;
    const parsed = _15.attempt(() => JSON.parse(body));
    if (_15.isError(parsed) || !_15.isPlainObject(parsed) && !_15.isArray(parsed)) continue;
    if (collectJsonToolSpecs(parsed).length > 0) return match.index;
  }
  return -1;
}
function getToolStartIndex(text) {
  const source = cleanAssistantArtifacts(text);
  const trimmedSource = source.trimStart();
  const jsonEnvelopeStart = trimmedSource.startsWith("{") || trimmedSource.startsWith("[") ? (() => {
    const start = source.search(/[\[{]/);
    if (start === -1 || util_default.isInsideMarkdownFence(source, start)) return -1;
    const end = source[start] === "[" ? source.lastIndexOf("]") + 1 : util_default.findJsonEnd(source, start);
    if (end === -1) return -1;
    const parsed = _15.attempt(() => JSON.parse(source.slice(start, end)));
    if (_15.isError(parsed) || !_15.isPlainObject(parsed) && !_15.isArray(parsed)) return -1;
    return collectJsonToolSpecs(parsed).length > 0 ? start : -1;
  })() : -1;
  const jsonFenceStart = findJsonFenceToolStart(source);
  const indexes = [
    findLineStartTag(source, /^\s*<?tool_call\s+name=["'][^"']+["']\s*>/gmi),
    findLineStartTag(source, /^\s*<｜DSML｜tool_calls>/gm),
    findLineStartTag(source, /^\s*｜DSML｜tool_calls>/gm),
    jsonFenceStart,
    findLineStartTag(source, /^\s*<bash(?:\s+[^>]*)?>/gmi),
    findLineStartTag(source, /^\s*<bash_notool>/gmi),
    findLineStartTag(source, /^\s*<bash-command(?:\s+[^>]*)?>/gmi),
    findLineStartTag(source, /^\s*<bash-tool-usage>/gmi),
    findLineStartTag(source, /^\s*<bash_script(?:\s+[^>]*)?>/gmi),
    findLineStartTag(source, /^\s*<command-line(?:\s+[^>]*)?>/gmi),
    findLineStartTag(source, /^\s*<tool_calls>/gmi),
    findLineStartTag(source, /^\s*<function_calls>/gmi),
    findLineStartTag(source, /^\s*<function\s+[^>]*>/gmi),
    findLineStartTag(source, /^\s*<invoke\s+name=["'][^"']+["']\s*>/gmi),
    findPatternStart(source, /Assistant requested tool\s+[A-Za-z0-9_\-.]+\s*:/gi),
    findLineStartTag(source, /(?:^|\n)\s*[A-Za-z][A-Za-z0-9_\-.]*\s*\(\s*\{/g),
    findLineStartTag(source, /^\s*\{"tool_call"/gmi),
    findLineStartTag(source, /^\s*\{"function_call"/gmi),
    findLineStartTag(source, /^\s*\{"custom_tool_call"/gmi),
    findLineStartTag(source, /^\s*\{"custom_tool_calls"/gmi),
    findLineStartTag(source, /^\s*\{"mcp_tool_call"/gmi),
    findLineStartTag(source, /^\s*\{"mcp_tool_calls"/gmi),
    jsonEnvelopeStart
  ].filter((index) => index !== -1);
  return indexes.length ? Math.min(...indexes) : -1;
}
function getPotentialToolStartIndex(text) {
  var _a4;
  const source = cleanAssistantArtifacts(text);
  const lineStart = source.lastIndexOf("\n") + 1;
  const line = source.slice(lineStart);
  const leadingWhitespace = ((_a4 = line.match(/^\s*/)) == null ? void 0 : _a4[0]) || "";
  const tagStart = lineStart + leadingWhitespace.length;
  const candidate = source.slice(tagStart);
  if (!candidate || util_default.isInsideMarkdownFence(source, tagStart)) return -1;
  if (TOOL_START_MARKERS.some((marker) => marker.startsWith(candidate) || candidate.startsWith(marker))) return tagStart;
  const inlineRequestedToolStart = findPatternStart(source, /Assistant requested tool\b/gi);
  if (inlineRequestedToolStart !== -1) return inlineRequestedToolStart;
  const trailingRequestedToolPrefixStart = findTrailingMarkerPrefixStart(source, "Assistant requested tool");
  if (trailingRequestedToolPrefixStart !== -1) return trailingRequestedToolPrefixStart;
  const fenceStart = source.lastIndexOf("```");
  if (fenceStart !== -1 && !util_default.isInsideMarkdownFence(source, fenceStart)) {
    const fenceCandidate = source.slice(fenceStart);
    if (/^```(?:json)?[ \t]*\r?\n[\s\S]*"(?:name|tool_call|function_call|tool_calls)"\s*:/i.test(fenceCandidate))
      return fenceStart;
  }
  return -1;
}
function mayBecomeToolCallPrefix(text) {
  const trimmed = cleanAssistantArtifacts(text).trimStart();
  if (!trimmed) return true;
  return TOOL_START_MARKERS.some((marker) => marker.startsWith(trimmed) || trimmed.startsWith(marker));
}

// src/lib/tool-prompt.ts
import _16 from "lodash";
function buildToolsPrompt(tools) {
  if (!_16.isArray(tools) || tools.length === 0) return "";
  const toolDescriptions = tools.map((tool) => {
    const fn = tool.type === "function" ? tool.function : tool;
    const name = _16.get(fn, "name") || _16.get(tool, "name");
    if (!name) return "";
    const description = _16.get(fn, "description") || _16.get(tool, "description") || "";
    const schema = _16.get(fn, "parameters") || _16.get(tool, "parameters") || _16.get(fn, "input_schema") || _16.get(tool, "input_schema") || _16.get(fn, "inputSchema") || _16.get(tool, "inputSchema") || {};
    return `- ${name}: ${description}
  input_schema: ${JSON.stringify(schema)}`;
  }).filter(Boolean).join("\n");
  if (!toolDescriptions) return "";
  return [
    "You have access to tools. When a tool is needed, do not describe the call in prose.",
    "If tools are provided for this request, prefer calling tools before giving a final answer.",
    "Do not answer from memory when a listed tool can verify or fetch the result.",
    "Output exactly one or more tool calls in this format and nothing else:",
    '<tool_call name="ToolName">{"arg":"value"}</tool_call>',
    "Do not wrap tool calls in markdown fences. Do not add text before or after tool calls.",
    "The JSON inside the tag must match the tool input schema.",
    "You may emit multiple tool calls across multiple turns until the task is complete.",
    "After receiving <tool_result ...>...</tool_result>, continue the task and call more tools if needed.",
    "Only end with a normal text answer when no further tool call is required.",
    "Available tools:",
    toolDescriptions
  ].join("\n");
}
function injectToolsIntoMessages(messages, tools) {
  const toolsPrompt = buildToolsPrompt(tools);
  if (!toolsPrompt) return messages;
  const augmentedMessages = [...messages];
  augmentedMessages.unshift({ role: "system", content: toolsPrompt });
  return augmentedMessages;
}

// src/api/routes/chat.ts
var DEEP_SEEK_CHAT_AUTHORIZATION = process2.env.DEEP_SEEK_CHAT_AUTHORIZATION;
var CHAT_SESSION_REUSE = ["1", "true", "yes", "on"].includes(String(process2.env.CHAT_SESSION_REUSE || "true").toLowerCase());
var CHAT_SESSION_TTL = Number(process2.env.CHAT_SESSION_TTL || 7 * 24 * 60 * 60 * 1e3);
var _a, _b;
(_b = (_a = setInterval(() => {
  storage_default.cleanup(CHAT_SESSION_TTL);
}, Math.min(CHAT_SESSION_TTL, 10 * 60 * 1e3))).unref) == null ? void 0 : _b.call(_a);
function extractMessageText(content) {
  if (_17.isString(content)) return content;
  if (_17.isArray(content))
    return content.map((part) => _17.isString(part) ? part : _17.get(part, "text") || "").filter(Boolean).join("\n");
  return _17.isNil(content) ? "" : String(content);
}
function fingerprintMessages(messages, count, charLimit = 200) {
  const userContents = messages.filter((m) => _17.get(m, "role") === "user").slice(0, count).map((m) => extractMessageText(_17.get(m, "content"))).filter(Boolean).map((text) => text.length > charLimit ? text.slice(0, charLimit) : text);
  return hashString(userContents.join("\n"));
}
function getUserTurnCount(messages) {
  return Math.max(messages.filter((message) => _17.get(message, "role") === "user").length, 1);
}
function buildTurnScopedKey(prefix, messages, turnCount) {
  return `${prefix}:u${turnCount}:${fingerprintMessages(messages, turnCount)}`;
}
function getLegacyTurnScopedKeys(prefix, messages, turnCount) {
  if (turnCount <= 1)
    return [
      `${prefix}:m1:${fingerprintMessages(messages, 1)}`,
      `${prefix}:m3:${fingerprintMessages(messages, 1)}`,
      `${prefix}:m5:${fingerprintMessages(messages, 1)}`
    ];
  if (turnCount === 2)
    return [
      `${prefix}:m3:${fingerprintMessages(messages, 2)}`,
      `${prefix}:m5:${fingerprintMessages(messages, 2)}`
    ];
  return [`${prefix}:m5:${fingerprintMessages(messages, turnCount)}`];
}
function appendUniqueSessionKey(keys, key) {
  if (!key || keys.includes(key)) return;
  keys.push(key);
}
function appendLegacySessionKeys(keys, prefix, messages, turnCount) {
  getLegacyTurnScopedKeys(prefix, messages, turnCount).forEach((key) => appendUniqueSessionKey(keys, key));
}
function getProgressiveKeys(request, model, messages, accountToken) {
  const sessionId = getExplicitSessionId(request);
  const prefix = buildSessionPrefix(request, "chat", model, accountToken);
  if (sessionId) return { currentKey: `${prefix}:session:${sessionId}`, previousKeys: [] };
  const turnCount = getUserTurnCount(messages);
  const currentKey = buildTurnScopedKey(prefix, messages, turnCount);
  const previousKeys = [];
  appendLegacySessionKeys(previousKeys, prefix, messages, turnCount);
  if (turnCount > 1) {
    appendUniqueSessionKey(previousKeys, buildTurnScopedKey(prefix, messages, turnCount - 1));
    appendLegacySessionKeys(previousKeys, prefix, messages, turnCount - 1);
  }
  if (turnCount > 2) {
    appendUniqueSessionKey(previousKeys, buildTurnScopedKey(prefix, messages, 1));
    appendLegacySessionKeys(previousKeys, prefix, messages, 1);
  }
  return { currentKey, previousKeys: previousKeys.filter((key) => key !== currentKey) };
}
function getChatSession(request, model, messages, explicitConversationId, accountToken) {
  if (!CHAT_SESSION_REUSE || explicitConversationId || !messages.length)
    return { sessionKey: null, refConvId: explicitConversationId };
  const { currentKey, previousKeys } = getProgressiveKeys(request, model, messages, accountToken);
  let session = storage_default.get(currentKey);
  if (!session) {
    const previousKey = previousKeys.find((key) => storage_default.has(key));
    if (previousKey) {
      session = storage_default.get(previousKey);
      if (session) {
        storage_default.set(currentKey, { ...session, updatedAt: Date.now() });
      }
    }
  }
  const canReuse = session && messages.length > session.messageCount && Date.now() - session.updatedAt <= CHAT_SESSION_TTL;
  if (!canReuse) return { sessionKey: currentKey, refConvId: void 0, refToken: void 0 };
  return { sessionKey: currentKey, refConvId: session.conversationId, refToken: session.token };
}
function updateChatSession(sessionKey, conversationId, messageCount, token) {
  if (!CHAT_SESSION_REUSE || !sessionKey || !conversationId || !/[0-9a-z\-]{36}@[0-9]+/.test(conversationId)) return;
  storage_default.set(sessionKey, {
    conversationId,
    messageCount,
    updatedAt: Date.now(),
    token
    // 🌟 持久化 Token 绑定
  });
}
function isInvalidMessageIdError(error) {
  const bizCode = _17.get(error, "data.biz_code") ?? _17.get(error, "data.data.biz_code");
  const bizMsg = String(_17.get(error, "data.biz_msg") || _17.get(error, "data.data.biz_msg") || _17.get(error, "message") || "").toLowerCase();
  return bizCode === 26 || bizMsg.includes("invalid message id");
}
function trackChatStream(source, sessionKey, messageCount, promptTokens, model, token) {
  const stream = new PassThrough3();
  let buffer = "";
  let accumulatedContent = "";
  let lastChunk = null;
  const processLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") {
      if (data === "[DONE]" && lastChunk) {
        const completionTokens = calculateTokens(accumulatedContent);
        const usageChunk = {
          ...lastChunk,
          choices: [],
          usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: promptTokens + completionTokens
          }
        };
        stream.write(`data: ${JSON.stringify(usageChunk)}

`);
      }
      return;
    }
    const chunk = _17.attempt(() => JSON.parse(data));
    if (_17.isError(chunk)) return;
    lastChunk = chunk;
    const content = _17.get(chunk, "choices[0].delta.content") || _17.get(chunk, "choices[0].text") || "";
    const reasoningContent = _17.get(chunk, "choices[0].delta.reasoning_content") || "";
    accumulatedContent += content + reasoningContent;
    const chunkId = _17.get(chunk, "id");
    if (_17.isString(chunkId) && /[0-9a-z\-]{36}@[0-9]+/.test(chunkId))
      updateChatSession(sessionKey, chunkId, messageCount, token);
  };
  source.on("data", (chunk) => {
    const text = chunk.toString();
    stream.write(chunk);
    buffer += text;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    lines.forEach(processLine);
  });
  source.once("error", (err) => {
    logger_default.error(`[chat stream] source error: ${err.message}`);
  });
  source.once("close", () => {
    try {
      if (buffer) processLine(buffer);
    } catch (e) {
      logger_default.error(`[chat stream] close finalization error: ${e.message}`);
    }
    if (!stream.closed) stream.end();
  });
  stream.on("error", (err) => {
    logger_default.error(`[chat stream] output stream error: ${err.message}`);
  });
  return stream;
}
function parseToolCallsFromContent(content, tools) {
  const { text, toolCalls } = splitTextAndToolCalls(content, tools || []);
  return {
    textContent: text,
    toolCalls: toolCalls.map((toolCall) => ({
      id: toolCall.call_id,
      type: "function",
      function: {
        name: toolCall.name,
        arguments: toolCall.arguments
      }
    }))
  };
}
function transformResponseWithToolCalls(response, tools) {
  if (!tools || !_17.isArray(tools) || tools.length === 0) return response;
  const message = _17.get(response, "choices[0].message");
  if (!message || !message.content) return response;
  const { textContent, toolCalls } = parseToolCallsFromContent(message.content, tools);
  if (toolCalls.length === 0) return response;
  logger_default.info(`[CHAT TOOL] Parsed ${toolCalls.length} tool call(s) from model output`);
  const newMessage = {
    role: "assistant",
    content: textContent || null,
    tool_calls: toolCalls
  };
  if (message.reasoning_content) {
    newMessage.reasoning_content = message.reasoning_content;
  }
  return {
    ...response,
    choices: [{
      ...response.choices[0],
      message: newMessage,
      finish_reason: "tool_calls"
    }]
  };
}
function isConversationId2(value) {
  if (!_17.isString(value)) return false;
  return /[0-9a-z\-]{36}@[0-9]+/.test(value);
}
function shouldRegenerateChatResponse(response, tools) {
  if (!tools || !_17.isArray(tools) || tools.length === 0) return false;
  const toolCalls = _17.get(response, "choices[0].message.tool_calls");
  if (_17.isArray(toolCalls) && toolCalls.length > 0) return false;
  const content = String(_17.get(response, "choices[0].message.content") || "").trim();
  return !content;
}
async function buildChatPayloadWithFallback(options) {
  const { model, messages, token, convId, audit, tools = [], promptTokens = 1 } = options;
  let chatResponse = await chat_default.createCompletion(model, messages, token, convId, 0, audit);
  let responsePayload = transformResponseWithToolCalls(chatResponse, tools);
  if (shouldRegenerateChatResponse(responsePayload, tools) && isConversationId2(chatResponse.id)) {
    logger_default.warn(`[CHAT REGEN] Empty tool response, attempting regenerate convId=${chatResponse.id}`);
    try {
      const normalizedModel = model.toLowerCase();
      const regenResponse = await chat_default.regenerateCompletion(
        normalizedModel,
        token,
        chatResponse.id,
        promptTokens,
        0,
        audit,
        {
          thinkingEnabled: Boolean(_17.get(chatResponse, "choices[0].message.reasoning_content")) || normalizedModel.includes("think") || normalizedModel.includes("r1"),
          searchEnabled: normalizedModel.includes("search")
        }
      );
      const regenPayload = transformResponseWithToolCalls(regenResponse, tools);
      logger_default.info(`[CHAT REGEN] Regenerate succeeded hasToolCalls=${_17.isArray(_17.get(regenPayload, "choices[0].message.tool_calls"))}`);
      chatResponse = regenResponse;
      responsePayload = regenPayload;
    } catch (regenErr) {
      logger_default.warn(`[CHAT REGEN] Regenerate failed: ${regenErr.message}`);
    }
  }
  return { chatResponse, responsePayload };
}
function createChatPayloadStream(response, promptTokens) {
  const stream = new PassThrough3();
  const id = String(_17.get(response, "id") || `chatcmpl-${util_default.uuid(false)}`);
  const mdl = String(_17.get(response, "model") || "deepseek-chat");
  const created = Number(_17.get(response, "created") || Math.floor(Date.now() / 1e3));
  const message = _17.get(response, "choices[0].message") || {};
  const content = String(_17.get(message, "content") || "");
  const toolCalls = _17.isArray(_17.get(message, "tool_calls")) ? message.tool_calls : [];
  const finishReason = toolCalls.length > 0 ? "tool_calls" : String(_17.get(response, "choices[0].finish_reason") || "stop");
  const writeLine = (value) => stream.write(`data: ${JSON.stringify(value)}

`);
  setImmediate(() => {
    writeLine({ id, model: mdl, created, object: "chat.completion.chunk", choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }] });
    if (content) {
      writeLine({ id, model: mdl, created, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content }, finish_reason: null }] });
    }
    if (toolCalls.length > 0) {
      writeLine({ id, model: mdl, created, object: "chat.completion.chunk", choices: [{ index: 0, delta: { tool_calls: toolCalls.map((tc, idx) => ({ index: idx, ...tc })) }, finish_reason: null }] });
    }
    writeLine({
      id,
      model: mdl,
      created,
      object: "chat.completion.chunk",
      choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
      usage: { prompt_tokens: promptTokens, completion_tokens: calculateTokens(content), total_tokens: promptTokens + calculateTokens(content) }
    });
    stream.write("data: [DONE]\n\n");
    stream.end();
  });
  stream.on("error", (err) => {
    logger_default.error(`[chat payload stream] error: ${err.message}`);
  });
  return stream;
}
var chat_default2 = {
  prefix: "/v1/chat",
  post: {
    "/completions": async (request) => {
      const audit = createAuditContext({
        endpoint: "chat.completions",
        route: "/v1/chat/completions",
        model: _17.get(request, "body.model"),
        stream: Boolean(_17.get(request, "body.stream"))
      });
      appendAuditEvent(audit, "request.received", {
        headers: sanitizeHeaders(request.headers),
        body: request.body
      });
      if (DEEP_SEEK_CHAT_AUTHORIZATION) {
        request.headers.authorization = "Bearer " + DEEP_SEEK_CHAT_AUTHORIZATION;
      }
      request.validate("body.conversation_id", (value) => _17.isUndefined(value) || _17.isString(value)).validate("body.messages", _17.isArray).validate("headers.authorization", _17.isString);
      const tokens = chat_default.tokenSplit(request.headers.authorization);
      let { model, conversation_id: convId, messages, stream, tools } = request.body;
      model = model.toLowerCase();
      const augmentedMessages = injectToolsIntoMessages(messages, tools);
      const sessionMessageCount = augmentedMessages.length;
      const selectedToken = selectTokenForSession(tokens, `${model}:${convId || ""}:${fingerprintMessages(augmentedMessages, 1, 500)}`);
      const prepared = getChatSession(request, model, augmentedMessages, convId, selectedToken);
      convId = prepared.refConvId;
      const finalToken = prepared.refToken || selectedToken;
      appendAuditEvent(audit, "request.prepared", {
        model,
        stream: Boolean(stream),
        rawMessages: messages,
        rawMessageSummary: summarizeMessages(messages),
        augmentedMessages,
        augmentedMessageSummary: summarizeMessages(augmentedMessages),
        tools,
        session: {
          sessionKey: prepared.sessionKey,
          refConvId: prepared.refConvId,
          hasBoundToken: Boolean(prepared.refToken),
          sessionMessageCount
        }
      });
      const hasTools = tools && _17.isArray(tools) && tools.length > 0;
      try {
        const promptTokens = calculateMessagesTokens(augmentedMessages);
        if (stream) {
          if (hasTools) {
            appendAuditEvent(audit, "response.stream.start", {
              sessionKey: prepared.sessionKey,
              refConvId: prepared.refConvId,
              promptTokens,
              buffered: true
            });
            const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
              model,
              messages: augmentedMessages,
              token: finalToken,
              convId,
              audit,
              tools,
              promptTokens
            });
            updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, finalToken);
            const responseStream = createChatPayloadStream(responsePayload, promptTokens);
            return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
              sessionKey: prepared.sessionKey,
              refConvId: prepared.refConvId
            })), {
              type: "text/event-stream"
            });
          }
          const source = await chat_default.createCompletionStream(model, augmentedMessages, finalToken, convId, 0, audit);
          const trackedStream = trackChatStream(source, prepared.sessionKey, sessionMessageCount, promptTokens, model, finalToken);
          appendAuditEvent(audit, "response.stream.start", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            promptTokens
          });
          return new Response(tapStreamForAudit(trackedStream, audit, "response.stream.completed", () => ({
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId
          })), {
            type: "text/event-stream"
          });
        } else {
          const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
            model,
            messages: augmentedMessages,
            token: finalToken,
            convId,
            audit,
            tools,
            promptTokens
          });
          updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, finalToken);
          appendAuditEvent(audit, "response.final", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            response: responsePayload
          });
          return responsePayload;
        }
      } catch (err) {
        if (prepared.refConvId && prepared.sessionKey && isInvalidMessageIdError(err)) {
          appendAuditEvent(audit, "failover.invalid_message_id", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            error: serializeError(err)
          });
          logger_default.warn(`[CHAT FAILOVER] Cached conversation ${prepared.refConvId} returned invalid message id, clearing session and retrying with full context...`);
          storage_default.delete(prepared.sessionKey);
          const promptTokens = calculateMessagesTokens(augmentedMessages);
          if (stream) {
            if (hasTools) {
              const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
                model,
                messages: augmentedMessages,
                token: finalToken,
                convId: void 0,
                audit,
                tools,
                promptTokens
              });
              updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, finalToken);
              const responseStream = createChatPayloadStream(responsePayload, promptTokens);
              return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
                sessionKey: prepared.sessionKey,
                refConvId: void 0,
                failover: "invalid_message_id"
              })), { type: "text/event-stream" });
            }
            const source = await chat_default.createCompletionStream(model, augmentedMessages, finalToken, void 0, 0, audit);
            const trackedStream = trackChatStream(source, prepared.sessionKey, sessionMessageCount, promptTokens, model, finalToken);
            return new Response(tapStreamForAudit(trackedStream, audit, "response.stream.completed", () => ({
              sessionKey: prepared.sessionKey,
              refConvId: void 0,
              failover: "invalid_message_id"
            })), { type: "text/event-stream" });
          } else {
            const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
              model,
              messages: augmentedMessages,
              token: finalToken,
              convId: void 0,
              audit,
              tools,
              promptTokens
            });
            updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, finalToken);
            appendAuditEvent(audit, "response.final", {
              sessionKey: prepared.sessionKey,
              refConvId: void 0,
              failover: "invalid_message_id",
              response: responsePayload
            });
            return responsePayload;
          }
        }
        const status = _17.get(err, "response.status") || _17.get(err, "status");
        if ((status === 401 || status === 403) && prepared.refToken && prepared.sessionKey) {
          appendAuditEvent(audit, "failover.token_rebind", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            status,
            error: serializeError(err)
          });
          logger_default.warn(`[CHAT FAILOVER] Bound token failed (${status}), clearing binding and retrying...`);
          storage_default.delete(prepared.sessionKey);
          const retryToken = selectTokenForSession(tokens.filter((item) => item !== finalToken), `${model}:${Date.now()}`) || selectedToken;
          const promptTokens = calculateMessagesTokens(augmentedMessages);
          if (stream) {
            if (hasTools) {
              const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
                model,
                messages: augmentedMessages,
                token: retryToken,
                convId,
                audit,
                tools,
                promptTokens
              });
              updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, retryToken);
              const responseStream = createChatPayloadStream(responsePayload, promptTokens);
              return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
                sessionKey: prepared.sessionKey,
                refConvId: convId,
                failover: "token_rebind"
              })), { type: "text/event-stream" });
            }
            const source = await chat_default.createCompletionStream(model, augmentedMessages, retryToken, convId, 0, audit);
            const trackedStream = trackChatStream(source, prepared.sessionKey, sessionMessageCount, promptTokens, model, retryToken);
            return new Response(tapStreamForAudit(trackedStream, audit, "response.stream.completed", () => ({
              sessionKey: prepared.sessionKey,
              refConvId: convId,
              failover: "token_rebind"
            })), { type: "text/event-stream" });
          } else {
            const { chatResponse, responsePayload } = await buildChatPayloadWithFallback({
              model,
              messages: augmentedMessages,
              token: retryToken,
              convId,
              audit,
              tools,
              promptTokens
            });
            updateChatSession(prepared.sessionKey, chatResponse.id, sessionMessageCount, retryToken);
            appendAuditEvent(audit, "response.final", {
              sessionKey: prepared.sessionKey,
              refConvId: convId,
              failover: "token_rebind",
              response: responsePayload
            });
            return responsePayload;
          }
        }
        appendAuditEvent(audit, "request.error", {
          error: serializeError(err)
        });
        throw err;
      }
    }
  }
};

// src/api/routes/ping.ts
var ping_default = {
  prefix: "/ping",
  get: {
    "": async () => "pong"
  }
};

// src/api/routes/token.ts
import _18 from "lodash";
var token_default = {
  prefix: "/token",
  post: {
    "/check": async (request) => {
      request.validate("body.token", _18.isString);
      const live = await chat_default.getTokenLiveStatus(request.body.token);
      return {
        live
      };
    }
  }
};

// src/api/routes/models.ts
import _19 from "lodash";
var MODEL_IDS = [
  "deepseek",
  "deepseek-chat",
  "deepseek-think",
  "deepseek-r1",
  "deepseek-search",
  "deepseek-expert",
  "deepseek-expert-r1",
  "deepseek-r1-expert",
  "deepseek-expert-search",
  "deepseek-expert-r1-search",
  "deepseek-r1-expert-search",
  "deepseek-r1-search",
  "deepseek-think-search",
  "deepseek-r1-silent",
  "deepseek-search-silent",
  "deepseek-think-fold",
  "deepseek-r1-fold"
];
var models_default = {
  prefix: "/v1",
  get: {
    "/models": async () => {
      return {
        "data": _19.uniq(MODEL_IDS).map((id) => ({
          id,
          object: "model",
          owned_by: "deepseek-free-api"
        }))
      };
    }
  }
};

// src/api/routes/responses.ts
import { PassThrough as PassThrough4 } from "stream";
import _20 from "lodash";
var DEEP_SEEK_CHAT_AUTHORIZATION2 = process.env.DEEP_SEEK_CHAT_AUTHORIZATION;
var RESPONSES_SESSION_REUSE = ["1", "true", "yes", "on"].includes(String(process.env.RESPONSES_SESSION_REUSE || "true").toLowerCase());
var RESPONSES_SESSION_TTL = Number(process.env.RESPONSES_SESSION_TTL || 7 * 24 * 60 * 60 * 1e3);
var RESPONSES_REFERENCE_PREFIX = "responses:response-ref:";
var _a2, _b2;
(_b2 = (_a2 = setInterval(() => {
  storage_default.cleanup(RESPONSES_SESSION_TTL);
}, Math.min(RESPONSES_SESSION_TTL, 10 * 60 * 1e3))).unref) == null ? void 0 : _b2.call(_a2);
function isConversationId3(value) {
  return _20.isString(value) && /[0-9a-z\-]{36}@[0-9]+/.test(value);
}
function getResponseReferenceKey(responseId) {
  return `${RESPONSES_REFERENCE_PREFIX}${responseId}`;
}
function updateResponseReference(responseId, conversationId, token) {
  if (!responseId || !isConversationId3(conversationId)) return;
  storage_default.set(getResponseReferenceKey(responseId), {
    conversationId,
    updatedAt: Date.now(),
    token
  });
}
function getResponseReference(responseId) {
  if (!responseId) return null;
  const reference = storage_default.get(getResponseReferenceKey(responseId));
  if (!reference || !isConversationId3(reference.conversationId)) return null;
  if (Date.now() - reference.updatedAt > RESPONSES_SESSION_TTL) return null;
  return reference;
}
function updateResponseHistorySession(sessionKey, conversationId, messageCount, token) {
  if (!RESPONSES_SESSION_REUSE || !sessionKey || !isConversationId3(conversationId)) return;
  const existing = storage_default.get(sessionKey);
  if ((existing == null ? void 0 : existing.conversationId) === conversationId && existing.messageCount === messageCount) {
    storage_default.set(sessionKey, { ...existing, updatedAt: Date.now() });
    return;
  }
  storage_default.set(sessionKey, {
    conversationId,
    messageCount,
    updatedAt: Date.now(),
    token
  });
  logger_default.info(`[RESPONSES SESSION] set history ${sessionKey} -> ${conversationId} (${messageCount})`);
}
function isInvalidMessageIdError2(error) {
  const bizCode = _20.get(error, "data.biz_code") ?? _20.get(error, "data.data.biz_code");
  const bizMsg = String(_20.get(error, "data.biz_msg") || _20.get(error, "data.data.biz_msg") || _20.get(error, "message") || "").toLowerCase();
  return bizCode === 26 || bizMsg.includes("invalid message id");
}
function stringifyToolOutput(output) {
  if (_20.isString(output)) return output;
  if (_20.isNil(output)) return "";
  return _20.attempt(() => JSON.stringify(output)) || String(output);
}
function safeJsonStringify2(value) {
  const result = _20.attempt(() => JSON.stringify(value));
  return _20.isError(result) ? "{}" : String(result || "{}");
}
function stringifyToolArgs(value) {
  if (_20.isString(value)) return value;
  if (_20.isNil(value)) return "{}";
  return safeJsonStringify2(value);
}
function normalizeToolArguments(value) {
  if (_20.isPlainObject(value)) return value;
  if (_20.isString(value)) return util_default.parseToolInput(value);
  if (_20.isArray(value)) return { input: value };
  if (_20.isNil(value)) return {};
  return { input: value };
}
function formatTodoList(items) {
  if (!_20.isArray(items)) return "";
  return items.map((item) => {
    const text = _20.get(item, "text") || _20.get(item, "content");
    if (!text) return "";
    return `- [${_20.get(item, "completed") ? "x" : " "}] ${text}`;
  }).filter(Boolean).join("\n");
}
function formatFileChanges(changes) {
  if (!_20.isArray(changes)) return "";
  return changes.map((change) => {
    const kind = _20.get(change, "kind") || "update";
    const path8 = _20.get(change, "path") || "unknown";
    return `${kind} ${path8}`;
  }).filter(Boolean).join("\n");
}
function getToolDisplayName(part) {
  return String(_20.get(part, "name") || _20.get(part, "tool") || "unknown").trim() || "unknown";
}
function extractObjectText(part) {
  const type = _20.get(part, "type");
  if (type === "message") return extractText(_20.get(part, "content"));
  if (type === "agent_message") return _20.get(part, "text") || extractText(_20.get(part, "content"));
  if (type === "reasoning") return _20.get(part, "text") || _20.get(part, "summary") || extractText(_20.get(part, "content"));
  if (type === "function_call_output") {
    const callId = _20.get(part, "call_id") || "unknown";
    return `Tool result (${callId}):
${stringifyToolOutput(_20.get(part, "output"))}`;
  }
  if (type === "function_call") {
    const name = _20.get(part, "name") || "unknown";
    return `Assistant requested tool ${name}: ${_20.get(part, "arguments") || "{}"}`;
  }
  if (type === "custom_tool_call_output") {
    const callId = _20.get(part, "call_id") || _20.get(part, "id") || "unknown";
    return `Tool result (${callId}):
${stringifyToolOutput(_20.get(part, "output") ?? _20.get(part, "content"))}`;
  }
  if (type === "custom_tool_call") {
    const name = getToolDisplayName(part);
    return `Assistant requested tool ${name}: ${stringifyToolArgs(_20.get(part, "input") ?? _20.get(part, "arguments"))}`;
  }
  if (type === "mcp_tool_call") {
    const server = _20.get(part, "server");
    const toolName = getToolDisplayName(part);
    const resultText = [
      extractText(_20.get(part, "result.content")),
      !_20.isNil(_20.get(part, "result.structured_content")) ? stringifyToolOutput(_20.get(part, "result.structured_content")) : "",
      _20.get(part, "error.message") || ""
    ].filter(Boolean).join("\n");
    if (resultText || ["completed", "failed"].includes(String(_20.get(part, "status") || "")))
      return `Tool result (${server ? `${server}:` : ""}${toolName}):
${resultText || String(_20.get(part, "status") || "completed")}`;
    return `Assistant requested tool ${toolName}: ${stringifyToolArgs(_20.get(part, "arguments") ?? _20.get(part, "input"))}`;
  }
  if (type === "command_execution") {
    const command = String(_20.get(part, "command") || "").trim();
    const exitCode = _20.has(part, "exit_code") ? `
Exit code: ${_20.get(part, "exit_code")}` : "";
    const aggregatedOutput = String(_20.get(part, "aggregated_output") || "").trim();
    if (aggregatedOutput || _20.has(part, "exit_code") || ["completed", "failed"].includes(String(_20.get(part, "status") || "")))
      return `Tool result (command_execution):
Command: ${command}${exitCode}${aggregatedOutput ? `
${aggregatedOutput}` : ""}`.trim();
    return `Assistant requested tool shell: ${safeJsonStringify2({ command })}`;
  }
  if (type === "file_change") {
    const changeText = formatFileChanges(_20.get(part, "changes"));
    const status = _20.get(part, "status");
    return [changeText ? "Tool result (file_change):" : "", changeText, status ? `status: ${status}` : ""].filter(Boolean).join("\n");
  }
  if (type === "web_search") {
    const query = _20.get(part, "query");
    return query ? `Assistant requested tool web_search: ${safeJsonStringify2({ query })}` : "";
  }
  if (type === "todo_list") {
    const todoText = formatTodoList(_20.get(part, "items"));
    return todoText ? `Todo list:
${todoText}` : "";
  }
  if (type === "error") return _20.get(part, "message") || stringifyToolOutput(_20.omit(part, ["type", "id"]));
  return _20.get(part, "text") || _20.get(part, "input_text") || stringifyToolOutput(_20.get(part, "output")) || "";
}
function extractText(content) {
  if (_20.isString(content)) return content;
  if (_20.isObject(content) && !_20.isArray(content)) return extractObjectText(content);
  if (_20.isArray(content))
    return content.map((part) => {
      if (_20.isString(part)) return part;
      if (_20.isObject(part)) return extractObjectText(part);
      return "";
    }).filter(Boolean).join("\n");
  return "";
}
function inferInputItemRole(item) {
  const explicitRole = _20.get(item, "role");
  if (_20.isString(explicitRole) && explicitRole) return explicitRole;
  const type = _20.get(item, "type");
  if (["function_call_output", "custom_tool_call_output", "command_execution", "file_change", "error"].includes(type))
    return "user";
  if (type === "mcp_tool_call") {
    const status = String(_20.get(item, "status") || "");
    if (_20.has(item, "result") || _20.has(item, "error") || status === "completed" || status === "failed")
      return "user";
  }
  return "assistant";
}
function normalizeInputItemToMessages(item) {
  if (_20.isString(item)) return [{ role: "user", content: item }];
  if (!_20.isObject(item)) return [];
  const itemType = _20.get(item, "type");
  if (!itemType && (_20.has(item, "role") || _20.has(item, "content"))) {
    const role2 = _20.get(item, "role") || "user";
    const content2 = extractText(_20.get(item, "content")) || extractText(item);
    return content2 ? [{ role: role2, content: content2 }] : [];
  }
  const role = inferInputItemRole(item);
  const content = extractText(_20.get(item, "content")) || extractText(item);
  return content ? [{ role, content }] : [];
}
function getSafeInstructions(instructions, tools = []) {
  const instructionText = extractText(instructions);
  return [instructionText, buildToolsPrompt(tools)].filter(Boolean).join("\n\n");
}
function normalizeInputToMessages(input, instructions, tools = []) {
  const messages = [];
  const safeInstructions = getSafeInstructions(instructions, tools);
  if (safeInstructions)
    messages.push({ role: "system", content: safeInstructions });
  if (_20.isString(input)) {
    messages.push({ role: "user", content: input });
    return messages;
  }
  if (_20.isObject(input) && !_20.isArray(input)) {
    messages.push(...normalizeInputItemToMessages(input));
    return messages;
  }
  if (_20.isArray(input)) {
    for (const item of input) {
      messages.push(...normalizeInputItemToMessages(item));
    }
  }
  return messages;
}
function isToolResultMessage(message) {
  return _20.get(message, "role") === "user" && String(_20.get(message, "content") || "").startsWith("Tool result (");
}
function getLatestActionMessages(messages, since = 0) {
  const candidates = messages.slice(Math.max(0, since));
  const source = candidates.length ? candidates : messages;
  const latestUserIndex = _20.findLastIndex(source, (message) => _20.get(message, "role") === "user");
  if (latestUserIndex === -1) return source.slice(-1);
  const latestUser = source[latestUserIndex];
  if (!isToolResultMessage(latestUser)) return [latestUser];
  const toolResults = [];
  for (let index = latestUserIndex; index >= 0; index--) {
    const message = source[index];
    if (!isToolResultMessage(message)) break;
    toolResults.unshift(message);
  }
  return toolResults.length ? toolResults : [latestUser];
}
function fingerprintMessages2(messages, count, charLimit = 200) {
  const userContents = messages.filter((m) => _20.get(m, "role") === "user").slice(0, count).map((m) => extractText(_20.get(m, "content"))).filter(Boolean).map((text) => text.length > charLimit ? text.slice(0, charLimit) : text);
  return hashString(userContents.join("\n"));
}
function getUserTurnCount2(messages) {
  return Math.max(messages.filter((message) => _20.get(message, "role") === "user").length, 1);
}
function buildTurnScopedKey2(prefix, messages, turnCount) {
  return `${prefix}:u${turnCount}:${fingerprintMessages2(messages, turnCount)}`;
}
function getLegacyTurnScopedKeys2(prefix, messages, turnCount) {
  if (turnCount <= 1)
    return [
      `${prefix}:m1:${fingerprintMessages2(messages, 1)}`,
      `${prefix}:m3:${fingerprintMessages2(messages, 1)}`,
      `${prefix}:m5:${fingerprintMessages2(messages, 1)}`
    ];
  if (turnCount === 2)
    return [
      `${prefix}:m3:${fingerprintMessages2(messages, 2)}`,
      `${prefix}:m5:${fingerprintMessages2(messages, 2)}`
    ];
  return [`${prefix}:m5:${fingerprintMessages2(messages, turnCount)}`];
}
function appendUniqueSessionKey2(keys, key) {
  if (!key || keys.includes(key)) return;
  keys.push(key);
}
function appendLegacySessionKeys2(keys, prefix, messages, turnCount) {
  getLegacyTurnScopedKeys2(prefix, messages, turnCount).forEach((key) => appendUniqueSessionKey2(keys, key));
}
function getProgressiveSessionKeys(request, endpoint, model, messages, accountToken) {
  const sessionId = getExplicitSessionId(request);
  const prefix = buildSessionPrefix(request, endpoint, model, accountToken);
  if (sessionId) return { currentKey: `${prefix}:session:${sessionId}`, previousKeys: [] };
  const historyMessages = messages.filter((message) => _20.get(message, "role") !== "system");
  const turnCount = getUserTurnCount2(historyMessages);
  const currentKey = buildTurnScopedKey2(prefix, historyMessages, turnCount);
  const previousKeys = [];
  appendLegacySessionKeys2(previousKeys, prefix, historyMessages, turnCount);
  if (turnCount > 1) {
    appendUniqueSessionKey2(previousKeys, buildTurnScopedKey2(prefix, historyMessages, turnCount - 1));
    appendLegacySessionKeys2(previousKeys, prefix, historyMessages, turnCount - 1);
  }
  if (turnCount > 2) {
    appendUniqueSessionKey2(previousKeys, buildTurnScopedKey2(prefix, historyMessages, 1));
    appendLegacySessionKeys2(previousKeys, prefix, historyMessages, 1);
  }
  return { currentKey, previousKeys: previousKeys.filter((key) => key !== currentKey) };
}
function getProgressiveCachedSession(currentKey, previousKeys, ttl) {
  let session = storage_default.get(currentKey);
  if (!session) {
    const previousKey = previousKeys.find((key) => storage_default.has(key));
    if (previousKey) {
      session = storage_default.get(previousKey);
      if (session) {
        storage_default.set(currentKey, { ...session, updatedAt: Date.now() });
      }
    }
  }
  if (!session || Date.now() - session.updatedAt > ttl) return null;
  return session;
}
function getMessagesForDeepSeek(request, model, input, instructions, tools = [], explicitConversationId, accountToken) {
  const messages = normalizeInputToMessages(input, instructions, tools);
  if (!RESPONSES_SESSION_REUSE || explicitConversationId)
    return {
      sessionKey: null,
      refConvId: explicitConversationId,
      refToken: void 0,
      messages: explicitConversationId ? getLatestActionMessages(messages) : messages
    };
  const { currentKey: sessionKey, previousKeys } = getProgressiveSessionKeys(request, "responses", model, messages, accountToken);
  const cached = getProgressiveCachedSession(sessionKey, previousKeys, RESPONSES_SESSION_TTL);
  const canReuse = cached && messages.length > cached.messageCount && Date.now() - cached.updatedAt <= RESPONSES_SESSION_TTL;
  if (!canReuse) {
    return {
      sessionKey,
      refConvId: void 0,
      messages
    };
  }
  return {
    sessionKey,
    refConvId: cached.conversationId,
    refToken: cached.token,
    messages: getLatestActionMessages(messages, cached.messageCount)
  };
}
function toResponsesUsage(usage) {
  const inputTokens = _20.get(usage, "input_tokens", _20.get(usage, "prompt_tokens", 1));
  const outputTokens = _20.get(usage, "output_tokens", _20.get(usage, "completion_tokens", 1));
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: _20.get(usage, "total_tokens", inputTokens + outputTokens)
  };
}
function createToolNameResolver2(tools = []) {
  return createToolNameResolver(tools);
}
function parseToolCalls(text, resolveToolName = createToolNameResolver2()) {
  return parseAgentToolCalls(text, resolveToolName);
}
function createResolvedToolCall(name, rawArguments, resolveToolName, ids = {}) {
  const parsedArgs = normalizeToolArguments(rawArguments);
  const resolved = resolveToolName(name, _20.isPlainObject(parsedArgs) ? parsedArgs : {});
  const input = _20.isPlainObject(resolved.args) ? resolved.args : {};
  return {
    id: String(ids.id || `fc_${util_default.uuid(false)}`),
    call_id: String(ids.callId || ids.id || `call_${util_default.uuid(false)}`),
    name: resolved.name,
    input,
    arguments: safeJsonStringify2(input)
  };
}
function mergeToolCalls(textCalls, nativeCalls) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  for (const toolCall of [...textCalls, ...nativeCalls]) {
    const key = `${toolCall.name}:${toolCall.arguments}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(toolCall);
  }
  return merged;
}
function collectNativeToolCallsFromMessage(message, resolveToolName) {
  const result = [];
  const toolCalls = _20.get(message, "tool_calls");
  if (_20.isArray(toolCalls)) {
    for (const call of toolCalls) {
      const name = _20.get(call, "function.name") || _20.get(call, "name");
      if (!name) continue;
      result.push(createResolvedToolCall(name, _20.get(call, "function.arguments") ?? _20.get(call, "arguments") ?? _20.get(call, "input"), resolveToolName, {
        id: _20.get(call, "id"),
        callId: _20.get(call, "call_id") || _20.get(call, "id")
      }));
    }
  }
  const functionCall = _20.get(message, "function_call");
  if (_20.isObject(functionCall)) {
    const name = _20.get(functionCall, "name");
    if (name)
      result.push(createResolvedToolCall(name, _20.get(functionCall, "arguments") ?? _20.get(functionCall, "input"), resolveToolName, {
        id: _20.get(functionCall, "id"),
        callId: _20.get(functionCall, "call_id") || _20.get(functionCall, "id")
      }));
  }
  return result;
}
function getToolStartIndex2(text) {
  return getToolStartIndex(text);
}
function getPotentialToolStartIndex2(text) {
  return getPotentialToolStartIndex(text);
}
function mayBecomeToolCallPrefix2(text) {
  return mayBecomeToolCallPrefix(text);
}
function cleanAssistantArtifacts2(text) {
  return cleanAssistantArtifacts(text);
}
function toResponsesPayload(chatResponse, resolveToolName = createToolNameResolver2()) {
  const message = _20.get(chatResponse, "choices[0].message", {});
  const content = cleanAssistantArtifacts2(message.content || "");
  const reasoningContent = message.reasoning_content || "";
  const created = chatResponse.created || util_default.unixTimestamp();
  const toolCalls = mergeToolCalls(
    parseToolCalls(content, resolveToolName),
    collectNativeToolCallsFromMessage(message, resolveToolName)
  );
  const output = [];
  if (reasoningContent)
    output.push({
      id: `rs_${chatResponse.id}`,
      type: "reasoning",
      status: "completed",
      summary: [],
      content: reasoningContent
    });
  if (toolCalls.length) {
    for (const toolCall of toolCalls) {
      output.push({
        id: toolCall.id,
        type: "function_call",
        status: "completed",
        call_id: toolCall.call_id,
        name: toolCall.name,
        arguments: toolCall.arguments
      });
    }
  } else {
    output.push({
      id: `msg_${chatResponse.id}`,
      type: "message",
      status: "completed",
      role: "assistant",
      content: [{
        type: "output_text",
        text: content,
        annotations: []
      }]
    });
  }
  return {
    id: `resp_${util_default.uuid(false)}`,
    object: "response",
    created_at: created,
    status: "completed",
    model: chatResponse.model,
    conversation_id: chatResponse.id,
    output,
    output_text: toolCalls.length ? "" : content,
    usage: toResponsesUsage(chatResponse.usage)
  };
}
function getResponsesMessageText(item) {
  return extractText(_20.get(item, "content"));
}
function getResponsesOutputText(responsePayload) {
  const directText = _20.get(responsePayload, "output_text");
  if (_20.isString(directText) && directText.trim()) return directText;
  return (_20.get(responsePayload, "output") || []).filter((item) => _20.get(item, "type") === "message").map((item) => getResponsesMessageText(item)).filter(Boolean).join("\n");
}
function hasResponsesFunctionCall(responsePayload) {
  return (_20.get(responsePayload, "output") || []).some((item) => _20.get(item, "type") === "function_call");
}
function shouldRegenerateToolResponse(responsePayload, tools) {
  return _20.isArray(tools) && tools.length > 0 && !hasResponsesFunctionCall(responsePayload) && !getResponsesOutputText(responsePayload).trim();
}
async function buildResponsesPayloadWithFallback(options) {
  const promptTokens = calculateMessagesTokens(options.messages);
  let chatResponse = await chat_default.createCompletion(options.model.toLowerCase(), options.messages, options.token, options.refConvId, 0, options.audit);
  let responsePayload = toResponsesPayload(chatResponse, options.resolveToolName);
  let regenerateAttempted = false;
  if (shouldRegenerateToolResponse(responsePayload, options.tools) && isConversationId3(chatResponse.id)) {
    regenerateAttempted = true;
    appendAuditEvent(options.audit, "responses.regenerate.start", {
      model: options.model,
      refConvId: options.refConvId,
      sourceConversationId: chatResponse.id,
      promptTokens,
      reason: "tool_response_without_text_or_function_call",
      response: responsePayload
    });
    try {
      const normalizedModel = options.model.toLowerCase();
      const regeneratedChatResponse = await chat_default.regenerateCompletion(
        normalizedModel,
        options.token,
        chatResponse.id,
        promptTokens,
        0,
        options.audit,
        {
          thinkingEnabled: Boolean(_20.get(chatResponse, "choices[0].message.reasoning_content")) || normalizedModel.includes("think") || normalizedModel.includes("r1"),
          searchEnabled: normalizedModel.includes("search")
        }
      );
      const regeneratedPayload = toResponsesPayload(regeneratedChatResponse, options.resolveToolName);
      appendAuditEvent(options.audit, "responses.regenerate.result", {
        model: options.model,
        sourceConversationId: chatResponse.id,
        regeneratedConversationId: regeneratedChatResponse.id,
        stillUnsatisfactory: shouldRegenerateToolResponse(regeneratedPayload, options.tools),
        response: regeneratedPayload
      });
      chatResponse = regeneratedChatResponse;
      responsePayload = regeneratedPayload;
    } catch (error) {
      appendAuditEvent(options.audit, "responses.regenerate.error", {
        model: options.model,
        sourceConversationId: chatResponse.id,
        error: serializeError(error)
      });
    }
  }
  return {
    chatResponse,
    responsePayload,
    promptTokens,
    regenerateAttempted
  };
}
function createResponsesPayloadStream(responsePayload) {
  const transStream = new PassThrough4();
  const writeEvent = (type, data) => {
    transStream.write(`event: ${type}
`);
    transStream.write(`data: ${JSON.stringify({ type, ...data })}

`);
  };
  setImmediate(() => {
    try {
      writeEvent("response.created", {
        response: {
          id: responsePayload.id,
          object: "response",
          created_at: responsePayload.created_at,
          status: "in_progress",
          model: responsePayload.model,
          conversation_id: responsePayload.conversation_id,
          output: []
        }
      });
      const outputItems = _20.isArray(responsePayload.output) ? responsePayload.output : [];
      outputItems.forEach((item, outputIndex) => {
        if (!_20.isObject(item)) return;
        if (_20.get(item, "type") === "message") {
          const itemId = _20.get(item, "id") || `msg_${util_default.uuid(false)}`;
          const messageText = getResponsesMessageText(item);
          const firstContent = _20.get(item, "content[0]") || { type: "output_text", annotations: [] };
          const finalPart = {
            type: _20.get(firstContent, "type") || "output_text",
            text: messageText,
            annotations: _20.get(firstContent, "annotations") || []
          };
          writeEvent("response.output_item.added", {
            output_index: outputIndex,
            item: {
              ...item,
              id: itemId,
              status: "in_progress",
              content: []
            }
          });
          writeEvent("response.content_part.added", {
            item_id: itemId,
            output_index: outputIndex,
            content_index: 0,
            part: { ...finalPart, text: "" }
          });
          if (messageText) {
            writeEvent("response.output_text.delta", {
              item_id: itemId,
              output_index: outputIndex,
              content_index: 0,
              delta: messageText
            });
          }
          writeEvent("response.output_text.done", {
            item_id: itemId,
            output_index: outputIndex,
            content_index: 0,
            text: messageText
          });
          writeEvent("response.content_part.done", {
            item_id: itemId,
            output_index: outputIndex,
            content_index: 0,
            part: finalPart
          });
          writeEvent("response.output_item.done", {
            output_index: outputIndex,
            item: {
              ...item,
              id: itemId,
              status: "completed",
              content: [finalPart]
            }
          });
          return;
        }
        if (_20.get(item, "type") === "function_call") {
          writeEvent("response.output_item.added", {
            output_index: outputIndex,
            item: {
              ...item,
              status: "in_progress",
              arguments: ""
            }
          });
          writeEvent("response.function_call_arguments.delta", {
            item_id: _20.get(item, "id"),
            output_index: outputIndex,
            delta: _20.get(item, "arguments") || ""
          });
          writeEvent("response.function_call_arguments.done", {
            item_id: _20.get(item, "id"),
            output_index: outputIndex,
            arguments: _20.get(item, "arguments") || ""
          });
          writeEvent("response.output_item.done", {
            output_index: outputIndex,
            item
          });
          return;
        }
        writeEvent("response.output_item.added", {
          output_index: outputIndex,
          item: {
            ...item,
            status: _20.get(item, "status") === "completed" ? "in_progress" : _20.get(item, "status")
          }
        });
        writeEvent("response.output_item.done", {
          output_index: outputIndex,
          item
        });
      });
      writeEvent("response.completed", {
        response: responsePayload
      });
    } catch (error) {
      logger_default.error(`[responses payload stream] emit error: ${error.message}`);
      writeEvent("error", {
        type: "error",
        error: {
          type: "internal_error",
          message: error.message || "Buffered response stream failed"
        }
      });
    }
    if (!transStream.closed) transStream.end();
  });
  transStream.on("error", (err) => {
    logger_default.error(`[responses payload stream] transStream error: ${err.message}`);
  });
  return transStream;
}
function createResponsesStream(chatStream, model, options = {}) {
  const {
    onConversationId,
    resolveToolName = createToolNameResolver2(),
    promptTokens = 1,
    deferTextUntilClose = false
  } = options;
  const responseId = `resp_${util_default.uuid(false)}`;
  const itemId = `msg_${util_default.uuid(false)}`;
  const created = util_default.unixTimestamp();
  const transStream = new PassThrough4();
  let buffer = "";
  let outputText = "";
  let latestConversationId = "";
  let streamedTextLength = 0;
  let messageStarted = false;
  const nativeToolCallMap = /* @__PURE__ */ new Map();
  const getNativeToolCallAccumulator = (index, id, callId) => {
    const key = `${index}:${String(id || callId || "")}`;
    if (!nativeToolCallMap.has(key)) {
      nativeToolCallMap.set(key, {
        id: String(id || `fc_${util_default.uuid(false)}`),
        call_id: String(callId || id || `call_${util_default.uuid(false)}`),
        name: "",
        arguments: ""
      });
    }
    return nativeToolCallMap.get(key);
  };
  const ingestNativeToolCallDelta = (delta) => {
    const deltaToolCalls = _20.get(delta, "tool_calls");
    if (_20.isArray(deltaToolCalls)) {
      for (const item of deltaToolCalls) {
        const index = Number(_20.get(item, "index", 0));
        const functionName = _20.get(item, "function.name") || _20.get(item, "name") || "";
        const functionArguments = _20.get(item, "function.arguments") || _20.get(item, "arguments") || "";
        const entry = getNativeToolCallAccumulator(index, _20.get(item, "id"), _20.get(item, "call_id"));
        if (functionName) entry.name = String(functionName);
        if (functionArguments) entry.arguments += String(functionArguments);
      }
    }
    const functionCall = _20.get(delta, "function_call");
    if (_20.isObject(functionCall)) {
      const entry = getNativeToolCallAccumulator(0, _20.get(functionCall, "id"), _20.get(functionCall, "call_id"));
      const functionName = _20.get(functionCall, "name") || "";
      const functionArguments = _20.get(functionCall, "arguments") || "";
      if (functionName) entry.name = String(functionName);
      if (functionArguments) entry.arguments += String(functionArguments);
    }
  };
  const finalizeNativeToolCalls = () => {
    return [...nativeToolCallMap.values()].filter((item) => item.name).map((item) => createResolvedToolCall(item.name, item.arguments, resolveToolName, {
      id: item.id,
      callId: item.call_id
    }));
  };
  const writeEvent = (type, data) => {
    transStream.write(`event: ${type}
`);
    transStream.write(`data: ${JSON.stringify({ type, ...data })}

`);
  };
  writeEvent("response.created", {
    response: {
      id: responseId,
      object: "response",
      created_at: created,
      status: "in_progress",
      model,
      output: []
    }
  });
  const writeMessageStart = () => {
    if (messageStarted) return;
    writeEvent("response.output_item.added", {
      output_index: 0,
      item: {
        id: itemId,
        type: "message",
        status: "in_progress",
        role: "assistant",
        content: []
      }
    });
    writeEvent("response.content_part.added", {
      item_id: itemId,
      output_index: 0,
      content_index: 0,
      part: { type: "output_text", text: "", annotations: [] }
    });
    messageStarted = true;
  };
  const writeTextDelta = (delta) => {
    if (!delta) return;
    writeMessageStart();
    writeEvent("response.output_text.delta", {
      item_id: itemId,
      output_index: 0,
      content_index: 0,
      delta
    });
  };
  const processLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") return;
    const chunk = _20.attempt(() => JSON.parse(data));
    if (_20.isError(chunk)) return;
    const chunkId = _20.get(chunk, "id");
    if (isConversationId3(chunkId)) {
      latestConversationId = chunkId;
      onConversationId == null ? void 0 : onConversationId(responseId, chunkId);
      onConversationId == null ? void 0 : onConversationId(itemId, chunkId);
    }
    ingestNativeToolCallDelta(_20.get(chunk, "choices[0].delta") || {});
    const delta = _20.get(chunk, "choices[0].delta.content") || "";
    if (!delta) return;
    outputText = cleanAssistantArtifacts2(outputText + delta);
    if (streamedTextLength === 0 && mayBecomeToolCallPrefix2(outputText)) return;
    const textEnd = getToolStartIndex2(outputText);
    const potentialToolStart = textEnd === -1 ? getPotentialToolStartIndex2(outputText) : -1;
    const streamableText = textEnd !== -1 ? outputText.slice(0, textEnd) : potentialToolStart === -1 ? outputText : outputText.slice(0, potentialToolStart);
    const textDelta = streamableText.slice(streamedTextLength);
    if (deferTextUntilClose) return;
    writeTextDelta(textDelta);
    streamedTextLength = streamableText.length;
  };
  chatStream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    lines.forEach(processLine);
  });
  chatStream.once("error", (err) => {
    logger_default.error(`[responses stream] chatStream error: ${err.message}`);
  });
  chatStream.once("close", () => {
    try {
      if (buffer) processLine(buffer);
    } catch (e) {
      logger_default.error(`[responses stream] processLine error: ${e.message}`);
    }
    try {
      const toolCalls = mergeToolCalls(parseToolCalls(outputText, resolveToolName), finalizeNativeToolCalls());
      const output = [];
      const visibleText = toolCalls.length ? "" : outputText;
      if (messageStarted || visibleText) {
        const messageItem = {
          id: itemId,
          type: "message",
          status: "completed",
          role: "assistant",
          content: [{ type: "output_text", text: visibleText, annotations: [] }]
        };
        if (streamedTextLength < visibleText.length) {
          writeTextDelta(visibleText.slice(streamedTextLength));
          streamedTextLength = visibleText.length;
        } else {
          writeMessageStart();
        }
        writeEvent("response.output_text.done", {
          item_id: itemId,
          output_index: 0,
          content_index: 0,
          text: visibleText
        });
        writeEvent("response.content_part.done", {
          item_id: itemId,
          output_index: 0,
          content_index: 0,
          part: { type: "output_text", text: visibleText, annotations: [] }
        });
        writeEvent("response.output_item.done", {
          output_index: 0,
          item: messageItem
        });
        output.push(messageItem);
      }
      if (toolCalls.length) {
        const startIndex = output.length;
        toolCalls.forEach((toolCall, toolCallIndex) => {
          const outputIndex = startIndex + toolCallIndex;
          const addedItem = {
            id: toolCall.id,
            type: "function_call",
            status: "in_progress",
            call_id: toolCall.call_id,
            name: toolCall.name,
            arguments: ""
          };
          const doneItem = { ...addedItem, status: "completed", arguments: toolCall.arguments };
          writeEvent("response.output_item.added", {
            output_index: outputIndex,
            item: addedItem
          });
          writeEvent("response.function_call_arguments.delta", {
            item_id: toolCall.id,
            output_index: outputIndex,
            delta: toolCall.arguments
          });
          writeEvent("response.function_call_arguments.done", {
            item_id: toolCall.id,
            output_index: outputIndex,
            arguments: toolCall.arguments
          });
          writeEvent("response.output_item.done", {
            output_index: outputIndex,
            item: doneItem
          });
          output.push(doneItem);
        });
      } else if (!output.length) {
        const messageItem = {
          id: itemId,
          type: "message",
          status: "completed",
          role: "assistant",
          content: [{ type: "output_text", text: visibleText, annotations: [] }]
        };
        if (streamedTextLength < visibleText.length) {
          writeTextDelta(visibleText.slice(streamedTextLength));
          streamedTextLength = visibleText.length;
        } else {
          writeMessageStart();
        }
        writeEvent("response.output_text.done", {
          item_id: itemId,
          output_index: 0,
          content_index: 0,
          text: visibleText
        });
        writeEvent("response.content_part.done", {
          item_id: itemId,
          output_index: 0,
          content_index: 0,
          part: { type: "output_text", text: visibleText, annotations: [] }
        });
        writeEvent("response.output_item.done", {
          output_index: 0,
          item: messageItem
        });
        output.push(messageItem);
      }
      writeEvent("response.completed", {
        response: {
          id: responseId,
          object: "response",
          created_at: created,
          status: "completed",
          model,
          conversation_id: latestConversationId || void 0,
          output,
          output_text: toolCalls.length ? visibleText : outputText,
          usage: toResponsesUsage({ prompt_tokens: promptTokens, completion_tokens: calculateTokens(outputText) })
        }
      });
    } catch (e) {
      logger_default.error(`[responses stream] close finalization error: ${e.message}`);
      writeEvent("error", {
        type: "error",
        error: { type: "internal_error", message: e.message || "Stream finalization failed" }
      });
    }
    if (!transStream.closed) transStream.end();
  });
  transStream.on("error", (err) => {
    logger_default.error(`[responses stream] transStream error: ${err.message}`);
  });
  return transStream;
}
var responses_default = {
  prefix: "/v1",
  post: {
    "/responses": async (request) => {
      var _a4;
      const audit = createAuditContext({
        endpoint: "responses",
        route: "/v1/responses",
        model: _20.get(request, "body.model"),
        stream: Boolean(_20.get(request, "body.stream"))
      });
      appendAuditEvent(audit, "request.received", {
        headers: sanitizeHeaders(request.headers),
        body: request.body
      });
      if (DEEP_SEEK_CHAT_AUTHORIZATION2) {
        request.headers.authorization = "Bearer " + DEEP_SEEK_CHAT_AUTHORIZATION2;
      }
      request.validate("body.model", _20.isString).validate("headers.authorization", _20.isString);
      const tokens = chat_default.tokenSplit(request.headers.authorization);
      const { model, input, instructions, stream } = request.body;
      const tools = _20.isArray(_20.get(request, "body.tools")) ? request.body.tools : [];
      const resolveToolName = createToolNameResolver2(tools);
      const normalizedMessages = normalizeInputToMessages(input, instructions, tools);
      const previousResponseId = _20.isString(_20.get(request, "body.previous_response_id")) ? String(_20.get(request, "body.previous_response_id")).trim() : void 0;
      const explicitConversationId = _20.isString(_20.get(request, "body.conversation_id")) ? String(_20.get(request, "body.conversation_id")).trim() : ((_a4 = getResponseReference(previousResponseId)) == null ? void 0 : _a4.conversationId) || (isConversationId3(previousResponseId) ? previousResponseId : void 0);
      const explicitReference = getResponseReference(previousResponseId);
      const selectedToken = selectTokenForSession(tokens, `${model}:${fingerprintMessages2(normalizedMessages, 1, 500)}`);
      const prepared = getMessagesForDeepSeek(request, model, input, instructions, tools, explicitConversationId, selectedToken);
      if (!prepared.messages.length)
        throw new Error("Params body.input invalid");
      const finalToken = (explicitReference == null ? void 0 : explicitReference.token) || prepared.refToken || selectedToken;
      appendAuditEvent(audit, "request.prepared", {
        model,
        stream: Boolean(stream),
        input,
        instructions,
        tools,
        normalizedMessages,
        normalizedMessageSummary: summarizeMessages(normalizedMessages),
        preparedMessages: prepared.messages,
        preparedMessageSummary: summarizeMessages(prepared.messages),
        session: {
          sessionKey: prepared.sessionKey,
          previousResponseId,
          refConvId: prepared.refConvId,
          explicitConversationId,
          explicitReferenceFound: Boolean(explicitReference),
          hasBoundToken: Boolean(prepared.refToken)
        }
      });
      const finalizeStructuredResponse = async (messagesToSend, tokenToUse, refConvIdToUse, meta = {}) => {
        const { chatResponse, responsePayload, regenerateAttempted } = await buildResponsesPayloadWithFallback({
          model,
          messages: messagesToSend,
          token: tokenToUse,
          refConvId: refConvIdToUse,
          resolveToolName,
          tools,
          audit
        });
        updateResponseHistorySession(prepared.sessionKey, chatResponse.id, normalizedMessages.length, tokenToUse);
        updateResponseReference(responsePayload.id, chatResponse.id, tokenToUse);
        appendAuditEvent(audit, "response.final", {
          sessionKey: prepared.sessionKey,
          refConvId: refConvIdToUse,
          regenerateAttempted,
          ...meta,
          response: responsePayload
        });
        return responsePayload;
      };
      const createBufferedToolResponseStream = async (messagesToSend, tokenToUse, refConvIdToUse, meta = {}) => {
        const { chatResponse, responsePayload, promptTokens, regenerateAttempted } = await buildResponsesPayloadWithFallback({
          model,
          messages: messagesToSend,
          token: tokenToUse,
          refConvId: refConvIdToUse,
          resolveToolName,
          tools,
          audit
        });
        updateResponseHistorySession(prepared.sessionKey, chatResponse.id, normalizedMessages.length, tokenToUse);
        updateResponseReference(responsePayload.id, chatResponse.id, tokenToUse);
        appendAuditEvent(audit, "response.stream.start", {
          promptTokens,
          sessionKey: prepared.sessionKey,
          refConvId: refConvIdToUse,
          buffered: true,
          regenerateAttempted,
          ...meta
        });
        const responseStream = createResponsesPayloadStream(responsePayload);
        return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
          sessionKey: prepared.sessionKey,
          refConvId: refConvIdToUse,
          buffered: true,
          regenerateAttempted,
          ...meta
        })), {
          type: "text/event-stream"
        });
      };
      try {
        if (stream) {
          if (tools.length > 0) {
            return createBufferedToolResponseStream(prepared.messages, finalToken, prepared.refConvId);
          }
          const promptTokens = calculateMessagesTokens(prepared.messages);
          const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), prepared.messages, finalToken, prepared.refConvId, 0, audit);
          const responseStream = createResponsesStream(chatStream, model, {
            resolveToolName,
            promptTokens,
            onConversationId: (responseId, conversationId) => {
              updateResponseHistorySession(prepared.sessionKey, conversationId, normalizedMessages.length, finalToken);
              updateResponseReference(responseId, conversationId, finalToken);
            }
          });
          appendAuditEvent(audit, "response.stream.start", {
            promptTokens,
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId
          });
          return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId
          })), {
            type: "text/event-stream"
          });
        }
        return finalizeStructuredResponse(prepared.messages, finalToken, prepared.refConvId);
      } catch (err) {
        if (prepared.refConvId && prepared.sessionKey && isInvalidMessageIdError2(err)) {
          appendAuditEvent(audit, "failover.invalid_message_id", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            error: serializeError(err)
          });
          logger_default.warn(`[RESPONSES FAILOVER] Cached conversation ${prepared.refConvId} returned invalid message id, clearing session and retrying with full context...`);
          storage_default.delete(prepared.sessionKey);
          if (stream) {
            if (tools.length > 0) {
              return createBufferedToolResponseStream(normalizedMessages, finalToken, void 0, {
                failover: "invalid_message_id"
              });
            }
            const promptTokens = calculateMessagesTokens(normalizedMessages);
            const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), normalizedMessages, finalToken, void 0, 0, audit);
            const responseStream = createResponsesStream(chatStream, model, {
              resolveToolName,
              promptTokens,
              deferTextUntilClose: tools.length > 0,
              onConversationId: (responseId, conversationId) => {
                updateResponseHistorySession(prepared.sessionKey, conversationId, normalizedMessages.length, finalToken);
                updateResponseReference(responseId, conversationId, finalToken);
              }
            });
            return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
              sessionKey: prepared.sessionKey,
              refConvId: void 0,
              failover: "invalid_message_id"
            })), {
              type: "text/event-stream"
            });
          }
          return finalizeStructuredResponse(normalizedMessages, finalToken, void 0, {
            failover: "invalid_message_id"
          });
        }
        const status = _20.get(err, "response.status") || _20.get(err, "status");
        if ((status === 401 || status === 403) && prepared.refToken && prepared.sessionKey) {
          appendAuditEvent(audit, "failover.token_rebind", {
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            status,
            error: serializeError(err)
          });
          logger_default.warn(`[RESPONSES FAILOVER] Bound token failed (${status}), clearing binding and retrying...`);
          storage_default.delete(prepared.sessionKey);
          const retryToken = selectTokenForSession(tokens.filter((item) => item !== finalToken), `${model}:${Date.now()}`) || selectedToken;
          if (stream) {
            if (tools.length > 0) {
              return createBufferedToolResponseStream(prepared.messages, retryToken, prepared.refConvId, {
                failover: "token_rebind"
              });
            }
            const promptTokens = calculateMessagesTokens(prepared.messages);
            const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), prepared.messages, retryToken, prepared.refConvId, 0, audit);
            const responseStream = createResponsesStream(chatStream, model, {
              resolveToolName,
              promptTokens,
              deferTextUntilClose: tools.length > 0,
              onConversationId: (responseId, conversationId) => {
                updateResponseHistorySession(prepared.sessionKey, conversationId, normalizedMessages.length, retryToken);
                updateResponseReference(responseId, conversationId, retryToken);
              }
            });
            return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
              sessionKey: prepared.sessionKey,
              refConvId: prepared.refConvId,
              failover: "token_rebind"
            })), { type: "text/event-stream" });
          }
          return finalizeStructuredResponse(prepared.messages, retryToken, prepared.refConvId, {
            failover: "token_rebind"
          });
        }
        appendAuditEvent(audit, "request.error", {
          error: serializeError(err)
        });
        throw err;
      }
    }
  }
};

// src/api/routes/messages.ts
import { PassThrough as PassThrough5 } from "stream";
import _21 from "lodash";
var DEEP_SEEK_CHAT_AUTHORIZATION3 = process.env.DEEP_SEEK_CHAT_AUTHORIZATION;
var ANTHROPIC_SESSION_REUSE = ["1", "true", "yes", "on"].includes(String(process.env.ANTHROPIC_SESSION_REUSE || "true").toLowerCase());
var ANTHROPIC_SESSION_TTL = Number(process.env.ANTHROPIC_SESSION_TTL || 7 * 24 * 60 * 60 * 1e3);
var _a3, _b3;
(_b3 = (_a3 = setInterval(() => {
  storage_default.cleanup(ANTHROPIC_SESSION_TTL);
}, Math.min(ANTHROPIC_SESSION_TTL, 10 * 60 * 1e3))).unref) == null ? void 0 : _b3.call(_a3);
function stringifyStructuredValue(value) {
  if (_21.isString(value)) return value;
  if (_21.isNil(value)) return "";
  return _21.attempt(() => JSON.stringify(value)) || String(value);
}
function formatTodoList2(items) {
  if (!_21.isArray(items)) return "";
  return items.map((item) => {
    const text = _21.get(item, "text") || _21.get(item, "content");
    if (!text) return "";
    return `- [${_21.get(item, "completed") ? "x" : " "}] ${text}`;
  }).filter(Boolean).join("\n");
}
function formatFileChanges2(changes) {
  if (!_21.isArray(changes)) return "";
  return changes.map((change) => {
    const kind = _21.get(change, "kind") || "update";
    const path8 = _21.get(change, "path") || "unknown";
    return `${kind} ${path8}`;
  }).filter(Boolean).join("\n");
}
function extractStructuredPartText(part) {
  if (_21.isString(part)) return part;
  if (!_21.isObject(part)) return "";
  const type = _21.get(part, "type");
  if (type === "message") return extractText2(_21.get(part, "content"));
  if (type === "agent_message") return _21.get(part, "text") || extractText2(_21.get(part, "content"));
  if (type === "reasoning") return _21.get(part, "text") || _21.get(part, "summary") || extractText2(_21.get(part, "content"));
  if (type === "tool_result") {
    const toolContent = extractText2(_21.get(part, "content"));
    const toolUseId = _21.get(part, "tool_use_id") || "unknown";
    const isError = _21.get(part, "is_error") === true;
    const status = isError ? "error" : "ok";
    return `<tool_result tool_use_id="${toolUseId}" status="${status}">${toolContent}</tool_result>`;
  }
  if (type === "tool_use") {
    const name = _21.get(part, "name") || "unknown";
    const input = JSON.stringify(_21.get(part, "input") || {});
    return `<tool_call name="${name}">${input}</tool_call>`;
  }
  if (type === "function_call") return `Assistant requested tool ${_21.get(part, "name") || "unknown"}: ${_21.get(part, "arguments") || "{}"}`;
  if (type === "function_call_output") return `Tool result (${_21.get(part, "call_id") || "unknown"}):
${extractText2(_21.get(part, "output"))}`;
  if (type === "custom_tool_call") return `Assistant requested tool ${_21.get(part, "name") || "unknown"}: ${stringifyStructuredValue(_21.get(part, "input") ?? _21.get(part, "arguments"))}`;
  if (type === "custom_tool_call_output") return `Tool result (${_21.get(part, "call_id") || _21.get(part, "id") || "unknown"}):
${extractText2(_21.get(part, "output") ?? _21.get(part, "content"))}`;
  if (type === "mcp_tool_call") {
    const server = _21.get(part, "server");
    const name = _21.get(part, "tool") || _21.get(part, "name") || "unknown";
    const resultText = [
      extractText2(_21.get(part, "result.content")),
      !_21.isNil(_21.get(part, "result.structured_content")) ? stringifyStructuredValue(_21.get(part, "result.structured_content")) : "",
      _21.get(part, "error.message") || ""
    ].filter(Boolean).join("\n");
    if (resultText || ["completed", "failed"].includes(String(_21.get(part, "status") || "")))
      return `Tool result (${server ? `${server}:` : ""}${name}):
${resultText || String(_21.get(part, "status") || "completed")}`;
    return `Assistant requested tool ${name}: ${stringifyStructuredValue(_21.get(part, "arguments") ?? _21.get(part, "input"))}`;
  }
  if (type === "command_execution") {
    const command = String(_21.get(part, "command") || "").trim();
    const exitCode = _21.has(part, "exit_code") ? `
Exit code: ${_21.get(part, "exit_code")}` : "";
    const aggregatedOutput = String(_21.get(part, "aggregated_output") || "").trim();
    if (aggregatedOutput || _21.has(part, "exit_code") || ["completed", "failed"].includes(String(_21.get(part, "status") || "")))
      return `Tool result (command_execution):
Command: ${command}${exitCode}${aggregatedOutput ? `
${aggregatedOutput}` : ""}`.trim();
    return `Assistant requested tool shell: ${JSON.stringify({ command })}`;
  }
  if (type === "file_change") {
    const changeText = formatFileChanges2(_21.get(part, "changes"));
    const status = _21.get(part, "status");
    return [changeText ? "Tool result (file_change):" : "", changeText, status ? `status: ${status}` : ""].filter(Boolean).join("\n");
  }
  if (type === "web_search") {
    const query = _21.get(part, "query");
    return query ? `Assistant requested tool web_search: ${JSON.stringify({ query })}` : "";
  }
  if (type === "todo_list") {
    const todoText = formatTodoList2(_21.get(part, "items"));
    return todoText ? `Todo list:
${todoText}` : "";
  }
  if (type === "error") return _21.get(part, "message") || stringifyStructuredValue(_21.omit(part, ["type", "id"]));
  return _21.get(part, "text") || "";
}
function extractText2(content) {
  if (_21.isString(content)) return content;
  if (_21.isArray(content))
    return content.map(extractStructuredPartText).filter(Boolean).join("\n");
  if (_21.isObject(content)) return extractStructuredPartText(content);
  return "";
}
function normalizeAnthropicMessages(messages, system, tools) {
  const normalizedMessages = [];
  const systemText = [extractText2(system), buildToolsPrompt(tools || [])].filter(Boolean).join("\n\n");
  if (systemText)
    normalizedMessages.push({ role: "system", content: systemText });
  for (const message of messages) {
    if (!_21.isObject(message)) continue;
    const role = _21.get(message, "role") || "user";
    const content = extractText2(_21.get(message, "content"));
    if (content) normalizedMessages.push({ role, content });
  }
  return normalizedMessages;
}
function fingerprintMessages3(messages, _system, count, charLimit = 200) {
  const userContents = messages.filter((m) => _21.get(m, "role") === "user").slice(0, count).map((m) => extractText2(_21.get(m, "content"))).filter(Boolean).map((text) => text.length > charLimit ? text.slice(0, charLimit) : text);
  return hashString(userContents.join("\n"));
}
function getUserTurnCount3(messages) {
  return Math.max(messages.filter((message) => _21.get(message, "role") === "user").length, 1);
}
function buildTurnScopedKey3(prefix, messages, system, turnCount) {
  return `${prefix}:u${turnCount}:${fingerprintMessages3(messages, system, turnCount)}`;
}
function getLegacyTurnScopedKeys3(prefix, messages, system, turnCount) {
  if (turnCount <= 1)
    return [
      `${prefix}:m1:${fingerprintMessages3(messages, system, 1)}`,
      `${prefix}:m3:${fingerprintMessages3(messages, system, 1)}`,
      `${prefix}:m5:${fingerprintMessages3(messages, system, 1)}`
    ];
  if (turnCount === 2)
    return [
      `${prefix}:m3:${fingerprintMessages3(messages, system, 2)}`,
      `${prefix}:m5:${fingerprintMessages3(messages, system, 2)}`
    ];
  return [`${prefix}:m5:${fingerprintMessages3(messages, system, turnCount)}`];
}
function appendUniqueSessionKey3(keys, key) {
  if (!key || keys.includes(key)) return;
  keys.push(key);
}
function appendLegacySessionKeys3(keys, prefix, messages, system, turnCount) {
  getLegacyTurnScopedKeys3(prefix, messages, system, turnCount).forEach((key) => appendUniqueSessionKey3(keys, key));
}
function getProgressiveSessionKeys2(request, endpoint, model, messages, system, accountToken) {
  const sessionId = getExplicitSessionId(request);
  const prefix = buildSessionPrefix(request, endpoint, model, accountToken);
  if (sessionId) return { currentKey: `${prefix}:session:${sessionId}`, previousKeys: [] };
  const turnCount = getUserTurnCount3(messages);
  const currentKey = buildTurnScopedKey3(prefix, messages, system, turnCount);
  const previousKeys = [];
  appendLegacySessionKeys3(previousKeys, prefix, messages, system, turnCount);
  if (turnCount > 1) {
    appendUniqueSessionKey3(previousKeys, buildTurnScopedKey3(prefix, messages, system, turnCount - 1));
    appendLegacySessionKeys3(previousKeys, prefix, messages, system, turnCount - 1);
  }
  if (turnCount > 2) {
    appendUniqueSessionKey3(previousKeys, buildTurnScopedKey3(prefix, messages, system, 1));
    appendLegacySessionKeys3(previousKeys, prefix, messages, system, 1);
  }
  return { currentKey, previousKeys: previousKeys.filter((key) => key !== currentKey) };
}
function getProgressiveCachedSession2(currentKey, previousKeys) {
  let session = storage_default.get(currentKey);
  if (!session) {
    const previousKey = previousKeys.find((key) => storage_default.has(key));
    if (previousKey) {
      session = storage_default.get(previousKey);
      if (session) {
        storage_default.set(currentKey, { ...session, updatedAt: Date.now() });
      }
    }
  }
  return session;
}
function getMessagesForDeepSeek2(request, model, messages, system, tools, explicitConversationId, accountToken) {
  if (!ANTHROPIC_SESSION_REUSE || explicitConversationId || !messages.length)
    return {
      sessionKey: null,
      refConvId: explicitConversationId,
      messages: normalizeAnthropicMessages(messages, system, tools)
    };
  const { currentKey: sessionKey, previousKeys } = getProgressiveSessionKeys2(request, "messages", model, messages, system || "", accountToken);
  const cached = getProgressiveCachedSession2(sessionKey, previousKeys);
  const canReuse = cached && messages.length > cached.messageCount && Date.now() - cached.updatedAt <= ANTHROPIC_SESSION_TTL;
  if (!canReuse) {
    logger_default.info(`[ANTHROPIC SESSION] miss sessionKey=${sessionKey} cached=${cached ? `mc=${cached.messageCount}` : "none"}`);
    return {
      sessionKey,
      refConvId: void 0,
      refToken: void 0,
      messages: normalizeAnthropicMessages(messages, system, tools)
    };
  }
  logger_default.info(`[ANTHROPIC SESSION] hit sessionKey=${sessionKey} convId=${cached.conversationId} cachedMC=${cached.messageCount} newMC=${messages.length}`);
  return {
    sessionKey,
    refConvId: cached.conversationId,
    refToken: cached.token,
    messages: normalizeAnthropicMessages([messages[messages.length - 1]], void 0, tools)
  };
}
function updateSession(sessionKey, conversationId, messageCount, token) {
  if (!ANTHROPIC_SESSION_REUSE || !sessionKey || !conversationId) return;
  storage_default.set(sessionKey, {
    conversationId,
    messageCount,
    updatedAt: Date.now(),
    token
  });
}
function isInvalidMessageIdError3(error) {
  const bizCode = _21.get(error, "data.biz_code") ?? _21.get(error, "data.data.biz_code");
  const bizMsg = String(_21.get(error, "data.biz_msg") || _21.get(error, "data.data.biz_msg") || _21.get(error, "message") || "").toLowerCase();
  return bizCode === 26 || bizMsg.includes("invalid message id");
}
function parseToolCalls2(text, tools = []) {
  const { text: cleanText, toolCalls } = splitTextAndToolCalls(text, tools);
  return {
    text: cleanText,
    toolCalls: toolCalls.map((toolCall) => ({
      id: toolCall.call_id.replace(/^call_/, "toolu_"),
      name: toolCall.name,
      input: toolCall.input
    }))
  };
}
function parseToolArguments(rawArguments) {
  if (_21.isPlainObject(rawArguments)) return rawArguments;
  const argumentText = String(rawArguments || "").trim();
  if (!argumentText) return {};
  const parsed = _21.attempt(() => JSON.parse(argumentText));
  if (!_21.isError(parsed) && _21.isPlainObject(parsed)) return parsed;
  return { raw: argumentText };
}
function toParsedToolCall(name, input, id) {
  const toolName = String(name || "").trim() || "unknown_tool";
  return {
    id: String(id || `toolu_${util_default.uuid(false)}`),
    name: toolName,
    input: _21.isPlainObject(input) ? input : {}
  };
}
function normalizeToolCallId(id, fallback) {
  const raw = String(id || fallback || "").trim();
  if (!raw) return `toolu_${util_default.uuid(false)}`;
  return raw.startsWith("toolu_") ? raw : `toolu_${raw}`;
}
function mergeParsedToolCalls(fromText, fromNative) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  const append = (call) => {
    const key = `${call.name}:${JSON.stringify(call.input || {})}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(call);
  };
  fromText.forEach(append);
  fromNative.forEach(append);
  return merged;
}
function collectNativeToolCallsFromMessage2(message) {
  const result = [];
  const toolCalls = _21.get(message, "tool_calls");
  if (_21.isArray(toolCalls)) {
    for (const call of toolCalls) {
      const name = _21.get(call, "function.name") || _21.get(call, "name");
      if (!name) continue;
      const id = normalizeToolCallId(_21.get(call, "id"));
      const input = parseToolArguments(_21.get(call, "function.arguments") || _21.get(call, "arguments"));
      result.push(toParsedToolCall(name, input, id));
    }
  }
  const functionCall = _21.get(message, "function_call");
  if (_21.isObject(functionCall)) {
    const name = _21.get(functionCall, "name");
    if (name) {
      const input = parseToolArguments(_21.get(functionCall, "arguments"));
      result.push(toParsedToolCall(name, input));
    }
  }
  return result;
}
function toAnthropicContentBlocks(text, nativeToolCalls = [], tools = []) {
  const { text: cleanText, toolCalls } = parseToolCalls2(text, tools);
  const mergedToolCalls = mergeParsedToolCalls(toolCalls, nativeToolCalls);
  const content = [];
  if (cleanText) content.push({ type: "text", text: cleanText });
  for (const toolCall of mergedToolCalls) {
    content.push({
      type: "tool_use",
      id: toolCall.id,
      name: toolCall.name,
      input: toolCall.input
    });
  }
  if (!content.length) content.push({ type: "text", text });
  return { content, hasToolUse: mergedToolCalls.length > 0 };
}
function toAnthropicPayload(chatResponse, tools = []) {
  const message = _21.get(chatResponse, "choices[0].message") || {};
  const text = _21.get(message, "content") || "";
  const reasoning = _21.get(chatResponse, "choices[0].message.reasoning_content") || "";
  const nativeToolCalls = collectNativeToolCallsFromMessage2(message);
  logger_default.info(`[messages payload] text(${text.length}): ${text.slice(0, 500)}${text.length > 500 ? "..." : ""}`);
  logger_default.info(`[messages payload] nativeCalls: ${JSON.stringify(nativeToolCalls)}`);
  const { content, hasToolUse } = toAnthropicContentBlocks(text, nativeToolCalls, tools);
  logger_default.info(`[messages payload] hasToolUse=${hasToolUse}`);
  if (reasoning) {
    content.unshift({
      type: "thinking",
      thinking: reasoning,
      signature: "ds-r1"
    });
  }
  return {
    id: `msg_${chatResponse.id}`,
    type: "message",
    role: "assistant",
    model: chatResponse.model,
    content,
    stop_reason: hasToolUse ? "tool_use" : "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: _21.get(chatResponse, "usage.prompt_tokens", 1),
      output_tokens: _21.get(chatResponse, "usage.completion_tokens", 1)
    }
  };
}
function createAnthropicStream(chatStream, model, options = {}) {
  const { deferOutput = false, onConversationId, promptTokens = 1, tools = [] } = options;
  const messageId = `msg_${util_default.uuid(false)}`;
  const transStream = new PassThrough5();
  let buffer = "";
  let outputText = "";
  let reasoningText = "";
  let textBlockStarted = false;
  let textBlockIndex = null;
  let thinkingBlockStarted = false;
  let thinkingBlockIndex = null;
  let thinkingBlockStopped = false;
  let thinkingWasStreamed = false;
  let deferredToolMode = false;
  let streamedTextLength = 0;
  let nextBlockIndex = 0;
  const nativeToolCallMap = /* @__PURE__ */ new Map();
  const getNativeToolCallAccumulator = (index, id) => {
    const key = `${index}:${String(id || "")}`;
    if (!nativeToolCallMap.has(key)) {
      nativeToolCallMap.set(key, {
        id: normalizeToolCallId(id, `tc_${index}_${util_default.uuid(false)}`),
        name: "",
        arguments: ""
      });
    }
    return nativeToolCallMap.get(key);
  };
  const ingestNativeToolCallDelta = (delta) => {
    const deltaToolCalls = _21.get(delta, "tool_calls");
    if (_21.isArray(deltaToolCalls)) {
      for (const item of deltaToolCalls) {
        const index = Number(_21.get(item, "index", 0));
        const functionName = _21.get(item, "function.name") || _21.get(item, "name") || "";
        const functionArguments = _21.get(item, "function.arguments") || _21.get(item, "arguments") || "";
        const entry = getNativeToolCallAccumulator(index, _21.get(item, "id"));
        if (functionName) entry.name = String(functionName);
        if (functionArguments) entry.arguments += String(functionArguments);
      }
    }
    const functionCall = _21.get(delta, "function_call");
    if (_21.isObject(functionCall)) {
      const entry = getNativeToolCallAccumulator(0, _21.get(functionCall, "id"));
      const functionName = _21.get(functionCall, "name") || "";
      const functionArguments = _21.get(functionCall, "arguments") || "";
      if (functionName) entry.name = String(functionName);
      if (functionArguments) entry.arguments += String(functionArguments);
    }
  };
  const finalizeNativeToolCalls = () => {
    return [...nativeToolCallMap.values()].filter((item) => item.name).map((item) => toParsedToolCall(item.name, parseToolArguments(item.arguments), item.id));
  };
  const writeEvent = (type, data) => {
    transStream.write(`event: ${type}
`);
    transStream.write(`data: ${JSON.stringify(data)}

`);
  };
  writeEvent("message_start", {
    type: "message_start",
    message: {
      id: messageId,
      type: "message",
      role: "assistant",
      model,
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: promptTokens, output_tokens: 0 }
    }
  });
  const writeThinkingDelta = (thinking) => {
    if (!thinking) return;
    reasoningText += thinking;
    if (textBlockStarted || deferredToolMode) return;
    if (thinkingBlockStopped) return;
    if (!thinkingBlockStarted) {
      thinkingBlockIndex = nextBlockIndex;
      writeEvent("content_block_start", {
        type: "content_block_start",
        index: thinkingBlockIndex,
        content_block: { type: "thinking", thinking: "", signature: "ds-r1" }
      });
      thinkingBlockStarted = true;
      thinkingWasStreamed = true;
      nextBlockIndex += 1;
    }
    writeEvent("content_block_delta", {
      type: "content_block_delta",
      index: thinkingBlockIndex,
      delta: { type: "thinking_delta", thinking }
    });
  };
  const stopThinkingBlock = () => {
    if (!thinkingBlockStarted || thinkingBlockStopped) return;
    writeEvent("content_block_stop", { type: "content_block_stop", index: thinkingBlockIndex });
    thinkingBlockStopped = true;
  };
  const ensureTextBlockStarted = () => {
    if (textBlockStarted) return;
    textBlockIndex = nextBlockIndex;
    nextBlockIndex += 1;
    writeEvent("content_block_start", {
      type: "content_block_start",
      index: textBlockIndex,
      content_block: { type: "text", text: "" }
    });
    textBlockStarted = true;
  };
  const processLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") return;
    const chunk = _21.attempt(() => JSON.parse(data));
    if (_21.isError(chunk)) return;
    const chunkId = _21.get(chunk, "id");
    if (_21.isString(chunkId) && /[0-9a-z\-]{36}@[0-9]+/.test(chunkId))
      onConversationId == null ? void 0 : onConversationId(chunkId);
    ingestNativeToolCallDelta(_21.get(chunk, "choices[0].delta") || {});
    const reasoningDelta = _21.get(chunk, "choices[0].delta.reasoning_content") || "";
    if (reasoningDelta) writeThinkingDelta(reasoningDelta);
    const delta = _21.get(chunk, "choices[0].delta.content") || "";
    if (!delta) return;
    stopThinkingBlock();
    outputText = cleanAssistantArtifacts(outputText + delta);
    let toolStartIndex = getToolStartIndex(outputText);
    if (toolStartIndex === -1 && !deferredToolMode) {
      const newText = outputText.slice(streamedTextLength);
      const newToolStartIndex = getToolStartIndex(newText);
      if (newToolStartIndex !== -1) {
        toolStartIndex = streamedTextLength + newToolStartIndex;
      }
    }
    const potentialToolStart = toolStartIndex === -1 ? getPotentialToolStartIndex(outputText) : -1;
    if (deferOutput && streamedTextLength === 0 && mayBecomeToolCallPrefix(outputText)) return;
    const streamableText = toolStartIndex !== -1 ? outputText.slice(0, toolStartIndex) : potentialToolStart === -1 ? outputText : outputText.slice(0, potentialToolStart);
    if (deferredToolMode || toolStartIndex !== -1) {
      const visibleDelta = streamableText.slice(streamedTextLength);
      if (visibleDelta) {
        ensureTextBlockStarted();
        writeEvent("content_block_delta", {
          type: "content_block_delta",
          index: textBlockIndex,
          delta: { type: "text_delta", text: visibleDelta }
        });
        streamedTextLength = streamableText.length;
      }
      deferredToolMode = true;
      return;
    }
    ensureTextBlockStarted();
    const textDelta = streamableText.slice(streamedTextLength);
    if (!textDelta) return;
    writeEvent("content_block_delta", {
      type: "content_block_delta",
      index: textBlockIndex,
      delta: { type: "text_delta", text: textDelta }
    });
    streamedTextLength = streamableText.length;
  };
  const writeContentBlock = (block) => {
    if (block.type === "tool_use") {
      const index2 = nextBlockIndex;
      nextBlockIndex += 1;
      writeEvent("content_block_start", {
        type: "content_block_start",
        index: index2,
        content_block: { type: "tool_use", id: block.id, name: block.name, input: {} }
      });
      writeEvent("content_block_delta", {
        type: "content_block_delta",
        index: index2,
        delta: { type: "input_json_delta", partial_json: JSON.stringify(block.input || {}) }
      });
      writeEvent("content_block_stop", { type: "content_block_stop", index: index2 });
      return;
    }
    if (textBlockStarted) return;
    const index = nextBlockIndex;
    nextBlockIndex += 1;
    writeEvent("content_block_start", {
      type: "content_block_start",
      index,
      content_block: { type: "text", text: "" }
    });
    writeEvent("content_block_delta", {
      type: "content_block_delta",
      index,
      delta: { type: "text_delta", text: block.text || "" }
    });
    writeEvent("content_block_stop", {
      type: "content_block_stop",
      index,
      content_block: { type: "text", text: block.text || "" }
    });
  };
  let chatStreamClosed = false;
  let chatStreamError = null;
  chatStream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    lines.forEach(processLine);
  });
  chatStream.once("error", (err) => {
    chatStreamError = err;
    logger_default.error(`[messages stream] chatStream error: ${err.message}`);
  });
  chatStream.once("close", () => {
    chatStreamClosed = true;
    if (buffer) processLine(buffer);
    try {
      const nativeCalls = finalizeNativeToolCalls();
      logger_default.info(`[messages stream close] outputText(${outputText.length}): ${outputText.slice(0, 500)}${outputText.length > 500 ? "..." : ""}`);
      logger_default.info(`[messages stream close] nativeCalls: ${JSON.stringify(nativeCalls)}`);
      const { content, hasToolUse } = toAnthropicContentBlocks(outputText, nativeCalls, tools);
      const finalContent = thinkingWasStreamed && reasoningText ? [{ type: "thinking", thinking: reasoningText, signature: "ds-r1" }, ...content] : content;
      logger_default.info(`[messages stream close] hasToolUse=${hasToolUse}, content=${JSON.stringify(finalContent).slice(0, 300)}`);
      stopThinkingBlock();
      if (textBlockStarted && textBlockIndex != null)
        writeEvent("content_block_stop", { type: "content_block_stop", index: textBlockIndex });
      content.forEach(writeContentBlock);
      const outputTokens = calculateTokens(outputText);
      writeEvent("message_delta", {
        type: "message_delta",
        delta: { stop_reason: hasToolUse ? "tool_use" : "end_turn", stop_sequence: null },
        usage: { output_tokens: outputTokens }
      });
      writeEvent("message_stop", {
        type: "message_stop",
        message: {
          id: messageId,
          type: "message",
          role: "assistant",
          model,
          content: finalContent,
          stop_reason: hasToolUse ? "tool_use" : "end_turn",
          stop_sequence: null,
          usage: { input_tokens: promptTokens, output_tokens: outputTokens }
        }
      });
    } catch (e) {
      logger_default.error(`[messages stream close] finalization error: ${e.message}`);
      writeEvent("error", {
        type: "error",
        error: { type: "internal_error", message: e.message || "Stream finalization failed" }
      });
      writeEvent("message_delta", {
        type: "message_delta",
        delta: { stop_reason: "end_turn", stop_sequence: null },
        usage: { output_tokens: calculateTokens(outputText) }
      });
      writeEvent("message_stop", {
        type: "message_stop"
      });
    }
    transStream.end();
  });
  transStream.on("error", (err) => {
    logger_default.error(`[messages stream] transStream error: ${err.message}`);
  });
  return transStream;
}
function isConversationId4(value) {
  if (!_21.isString(value)) return false;
  return /[0-9a-z\-]{36}@[0-9]+/.test(value);
}
function shouldRegenerateMessagesResponse(payload, tools) {
  if (!tools || !_21.isArray(tools) || tools.length === 0) return false;
  const content = _21.isArray(_21.get(payload, "content")) ? _21.get(payload, "content") : [];
  const hasToolUse = content.some((b) => b.type === "tool_use");
  if (hasToolUse) return false;
  const text = content.filter((b) => b.type === "text").map((b) => String(b.text || "")).join("").trim();
  return !text;
}
async function buildMessagesPayloadWithFallback(options) {
  var _a4;
  const { model, messages, token, refConvId, audit, tools = [], promptTokens = 1 } = options;
  let chatResponse = await chat_default.createCompletion(model, messages, token, refConvId, 0, audit);
  let responsePayload = toAnthropicPayload(chatResponse, tools);
  if (shouldRegenerateMessagesResponse(responsePayload, tools) && isConversationId4(chatResponse.id)) {
    logger_default.warn(`[MESSAGES REGEN] Empty tool response, attempting regenerate convId=${chatResponse.id}`);
    try {
      const normalizedModel = model.toLowerCase();
      const regenResponse = await chat_default.regenerateCompletion(
        normalizedModel,
        token,
        chatResponse.id,
        promptTokens,
        0,
        audit,
        {
          thinkingEnabled: Boolean(_21.get(chatResponse, "choices[0].message.reasoning_content")) || normalizedModel.includes("think") || normalizedModel.includes("r1"),
          searchEnabled: normalizedModel.includes("search")
        }
      );
      const regenPayload = toAnthropicPayload(regenResponse, tools);
      logger_default.info(`[MESSAGES REGEN] Regenerate succeeded hasToolUse=${(_a4 = regenPayload.content) == null ? void 0 : _a4.some((b) => b.type === "tool_use")}`);
      chatResponse = regenResponse;
      responsePayload = regenPayload;
    } catch (regenErr) {
      logger_default.warn(`[MESSAGES REGEN] Regenerate failed: ${regenErr.message}`);
    }
  }
  return { chatResponse, responsePayload };
}
function createBufferedAnthropicToolStream(responsePayload, model, promptTokens) {
  const stream = new PassThrough5();
  const messageId = String(_21.get(responsePayload, "id") || `msg_${util_default.uuid(false)}`);
  const content = _21.isArray(_21.get(responsePayload, "content")) ? _21.get(responsePayload, "content") : [];
  const stopReason = String(_21.get(responsePayload, "stop_reason") || "end_turn");
  const writeEvent = (type, data) => {
    stream.write(`event: ${type}
`);
    stream.write(`data: ${JSON.stringify(data)}

`);
  };
  setImmediate(() => {
    writeEvent("message_start", {
      type: "message_start",
      message: {
        id: messageId,
        type: "message",
        role: "assistant",
        model,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: promptTokens, output_tokens: 0 }
      }
    });
    let blockIndex = 0;
    for (const block of content) {
      const index = blockIndex++;
      if (block.type === "thinking") {
        writeEvent("content_block_start", { type: "content_block_start", index, content_block: { type: "thinking", thinking: "", signature: "ds-r1" } });
        writeEvent("content_block_delta", { type: "content_block_delta", index, delta: { type: "thinking_delta", thinking: String(block.thinking || "") } });
        writeEvent("content_block_stop", { type: "content_block_stop", index });
      } else if (block.type === "text") {
        writeEvent("content_block_start", { type: "content_block_start", index, content_block: { type: "text", text: "" } });
        writeEvent("content_block_delta", { type: "content_block_delta", index, delta: { type: "text_delta", text: String(block.text || "") } });
        writeEvent("content_block_stop", { type: "content_block_stop", index });
      } else if (block.type === "tool_use") {
        writeEvent("content_block_start", { type: "content_block_start", index, content_block: { type: "tool_use", id: block.id, name: block.name, input: {} } });
        writeEvent("content_block_delta", { type: "content_block_delta", index, delta: { type: "input_json_delta", partial_json: JSON.stringify(block.input || {}) } });
        writeEvent("content_block_stop", { type: "content_block_stop", index });
      }
    }
    const textContent = content.filter((b) => b.type === "text").map((b) => String(b.text || "")).join("");
    const outputTokens = calculateTokens(textContent);
    writeEvent("message_delta", {
      type: "message_delta",
      delta: { stop_reason: stopReason, stop_sequence: null },
      usage: { output_tokens: outputTokens }
    });
    writeEvent("message_stop", {
      type: "message_stop",
      message: {
        id: messageId,
        type: "message",
        role: "assistant",
        model,
        content,
        stop_reason: stopReason,
        stop_sequence: null,
        usage: { input_tokens: promptTokens, output_tokens: outputTokens }
      }
    });
    stream.end();
  });
  stream.on("error", (err) => {
    logger_default.error(`[messages buffered tool stream] error: ${err.message}`);
  });
  return stream;
}
async function handleMessages(request) {
  const audit = createAuditContext({
    endpoint: "messages",
    route: "/v1/messages",
    model: _21.get(request, "body.model"),
    stream: Boolean(_21.get(request, "body.stream"))
  });
  appendAuditEvent(audit, "request.received", {
    headers: sanitizeHeaders(request.headers),
    body: request.body
  });
  if (DEEP_SEEK_CHAT_AUTHORIZATION3) {
    request.headers.authorization = "Bearer " + DEEP_SEEK_CHAT_AUTHORIZATION3;
  }
  request.validate("body.model", _21.isString).validate("body.messages", _21.isArray).validate("headers.authorization", _21.isString);
  const tokens = chat_default.tokenSplit(request.headers.authorization);
  const { model, messages, system, tools, stream, conversation_id } = request.body;
  const selectedToken = selectTokenForSession(tokens, `${model}:${conversation_id || ""}:${fingerprintMessages3(messages, extractText2(system), 1, 500)}`);
  const fullMessages = normalizeAnthropicMessages(messages, system, tools);
  const prepared = getMessagesForDeepSeek2(request, model, messages, system, tools, conversation_id, selectedToken);
  if (!fullMessages.length)
    throw new Error("Params body.messages invalid");
  const finalToken = prepared.refToken || selectedToken;
  appendAuditEvent(audit, "request.prepared", {
    model,
    stream: Boolean(stream),
    rawMessages: messages,
    rawMessageSummary: summarizeMessages(messages),
    normalizedMessages: fullMessages,
    normalizedMessageSummary: summarizeMessages(fullMessages),
    preparedMessages: prepared.messages,
    preparedMessageSummary: summarizeMessages(prepared.messages),
    system,
    tools,
    session: {
      sessionKey: prepared.sessionKey,
      refConvId: prepared.refConvId,
      hasBoundToken: Boolean(prepared.refToken)
    }
  });
  const hasTools = tools && _21.isArray(tools) && tools.length > 0;
  try {
    if (stream) {
      const promptTokens2 = calculateMessagesTokens(prepared.messages);
      if (hasTools) {
        appendAuditEvent(audit, "response.stream.start", {
          promptTokens: promptTokens2,
          sessionKey: prepared.sessionKey,
          refConvId: prepared.refConvId,
          buffered: true
        });
        const { chatResponse: chatResponse2, responsePayload: responsePayload2 } = await buildMessagesPayloadWithFallback({
          model: model.toLowerCase(),
          messages: prepared.messages,
          token: finalToken,
          refConvId: prepared.refConvId,
          audit,
          tools,
          promptTokens: promptTokens2
        });
        updateSession(prepared.sessionKey, chatResponse2.id, messages.length, finalToken);
        const responseStream2 = createBufferedAnthropicToolStream(responsePayload2, model, promptTokens2);
        return new Response(tapStreamForAudit(responseStream2, audit, "response.stream.completed", () => ({
          sessionKey: prepared.sessionKey,
          refConvId: prepared.refConvId
        })), {
          type: "text/event-stream"
        });
      }
      const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), prepared.messages, finalToken, prepared.refConvId, 0, audit);
      const responseStream = createAnthropicStream(chatStream, model, {
        deferOutput: false,
        onConversationId: (conversationId) => updateSession(prepared.sessionKey, conversationId, messages.length, finalToken),
        promptTokens: promptTokens2,
        tools
      });
      appendAuditEvent(audit, "response.stream.start", {
        promptTokens: promptTokens2,
        sessionKey: prepared.sessionKey,
        refConvId: prepared.refConvId
      });
      return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
        sessionKey: prepared.sessionKey,
        refConvId: prepared.refConvId
      })), {
        type: "text/event-stream"
      });
    }
    const promptTokens = calculateMessagesTokens(prepared.messages);
    const { chatResponse, responsePayload } = await buildMessagesPayloadWithFallback({
      model: model.toLowerCase(),
      messages: prepared.messages,
      token: finalToken,
      refConvId: prepared.refConvId,
      audit,
      tools,
      promptTokens
    });
    updateSession(prepared.sessionKey, chatResponse.id, messages.length, finalToken);
    appendAuditEvent(audit, "response.final", {
      sessionKey: prepared.sessionKey,
      refConvId: prepared.refConvId,
      response: responsePayload
    });
    return responsePayload;
  } catch (err) {
    if (prepared.refConvId && prepared.sessionKey && isInvalidMessageIdError3(err)) {
      appendAuditEvent(audit, "failover.invalid_message_id", {
        sessionKey: prepared.sessionKey,
        refConvId: prepared.refConvId,
        error: serializeError(err)
      });
      logger_default.warn(`[ANTHROPIC FAILOVER] Cached conversation ${prepared.refConvId} returned invalid message id, clearing session and retrying with full context...`);
      storage_default.delete(prepared.sessionKey);
      const promptTokens = calculateMessagesTokens(fullMessages);
      if (stream) {
        if (hasTools) {
          const { chatResponse: chatResponse2, responsePayload: responsePayload2 } = await buildMessagesPayloadWithFallback({
            model: model.toLowerCase(),
            messages: fullMessages,
            token: finalToken,
            refConvId: void 0,
            audit,
            tools,
            promptTokens
          });
          updateSession(prepared.sessionKey, chatResponse2.id, messages.length, finalToken);
          const responseStream2 = createBufferedAnthropicToolStream(responsePayload2, model, promptTokens);
          return new Response(tapStreamForAudit(responseStream2, audit, "response.stream.completed", () => ({
            sessionKey: prepared.sessionKey,
            refConvId: void 0,
            failover: "invalid_message_id"
          })), { type: "text/event-stream" });
        }
        const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), fullMessages, finalToken, void 0, 0, audit);
        const responseStream = createAnthropicStream(chatStream, model, {
          deferOutput: false,
          onConversationId: (conversationId) => updateSession(prepared.sessionKey, conversationId, messages.length, finalToken),
          promptTokens,
          tools
        });
        return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
          sessionKey: prepared.sessionKey,
          refConvId: void 0,
          failover: "invalid_message_id"
        })), { type: "text/event-stream" });
      }
      const { chatResponse, responsePayload } = await buildMessagesPayloadWithFallback({
        model: model.toLowerCase(),
        messages: fullMessages,
        token: finalToken,
        refConvId: void 0,
        audit,
        tools,
        promptTokens
      });
      updateSession(prepared.sessionKey, chatResponse.id, messages.length, finalToken);
      appendAuditEvent(audit, "response.final", {
        sessionKey: prepared.sessionKey,
        refConvId: void 0,
        failover: "invalid_message_id",
        response: responsePayload
      });
      return responsePayload;
    }
    const status = _21.get(err, "response.status") || _21.get(err, "status");
    if ((status === 401 || status === 403) && prepared.refToken && prepared.sessionKey) {
      appendAuditEvent(audit, "failover.token_rebind", {
        sessionKey: prepared.sessionKey,
        refConvId: prepared.refConvId,
        status,
        error: serializeError(err)
      });
      logger_default.warn(`[ANTHROPIC FAILOVER] Bound token failed (${status}), clearing binding and retrying...`);
      storage_default.delete(prepared.sessionKey);
      const retryToken = selectTokenForSession(tokens.filter((item) => item !== finalToken), `${model}:${Date.now()}`) || selectedToken;
      const promptTokens = calculateMessagesTokens(prepared.messages);
      if (stream) {
        if (hasTools) {
          const { chatResponse: chatResponse2, responsePayload: responsePayload2 } = await buildMessagesPayloadWithFallback({
            model: model.toLowerCase(),
            messages: prepared.messages,
            token: retryToken,
            refConvId: prepared.refConvId,
            audit,
            tools,
            promptTokens
          });
          updateSession(prepared.sessionKey, chatResponse2.id, messages.length, retryToken);
          const responseStream2 = createBufferedAnthropicToolStream(responsePayload2, model, promptTokens);
          return new Response(tapStreamForAudit(responseStream2, audit, "response.stream.completed", () => ({
            sessionKey: prepared.sessionKey,
            refConvId: prepared.refConvId,
            failover: "token_rebind"
          })), { type: "text/event-stream" });
        }
        const chatStream = await chat_default.createCompletionStream(model.toLowerCase(), prepared.messages, retryToken, prepared.refConvId, 0, audit);
        const responseStream = createAnthropicStream(chatStream, model, {
          deferOutput: false,
          onConversationId: (conversationId) => updateSession(prepared.sessionKey, conversationId, messages.length, retryToken),
          promptTokens,
          tools
        });
        return new Response(tapStreamForAudit(responseStream, audit, "response.stream.completed", () => ({
          sessionKey: prepared.sessionKey,
          refConvId: prepared.refConvId,
          failover: "token_rebind"
        })), { type: "text/event-stream" });
      }
      const { chatResponse, responsePayload } = await buildMessagesPayloadWithFallback({
        model: model.toLowerCase(),
        messages: prepared.messages,
        token: retryToken,
        refConvId: prepared.refConvId,
        audit,
        tools,
        promptTokens
      });
      updateSession(prepared.sessionKey, chatResponse.id, messages.length, retryToken);
      appendAuditEvent(audit, "response.final", {
        sessionKey: prepared.sessionKey,
        refConvId: prepared.refConvId,
        failover: "token_rebind",
        response: responsePayload
      });
      return responsePayload;
    }
    appendAuditEvent(audit, "request.error", {
      error: serializeError(err)
    });
    throw err;
  }
}
var anthropicMessages = {
  prefix: "/anthropic/v1",
  post: {
    "/messages": handleMessages
  }
};
var messages_default = {
  prefix: "/v1",
  post: {
    "/messages": handleMessages
  }
};

// src/api/controllers/mcp.ts
import { Server as Server2 } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import _22 from "lodash";
var MCPServerManager = class {
  static sessions = {};
  static createServer(token) {
    const server = new Server2(
      { name: "deepseek-free-api-mcp", version: "1.2.0" },
      { capabilities: { tools: {} } }
    );
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search",
          description: "Perform a web search using DeepSeek. Returns latest information with citations.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" }
            },
            required: ["query"]
          }
        }
      ]
    }));
    server.setRequestHandler(CallToolRequestSchema, async (call) => {
      const { name, arguments: args } = call.params;
      logger_default.info(`[MCP] Call tool: ${name}`);
      try {
        if (name === "search") {
          const { query } = args;
          const messages = [{ role: "user", content: query }];
          const result = await chat_default.createCompletion("deepseek-chat-search", messages, token);
          const content = _22.get(result, "choices[0].message.content", "No content.");
          const citations = _22.get(result, "choices[0].message.citations", []);
          let text = content;
          if (citations.length > 0) {
            const citationText = citations.map((c) => `[${c.index}] ${c.title} (${c.url})`).join("\n");
            text += `

### References:
${citationText}`;
          }
          return { content: [{ type: "text", text }] };
        }
        throw new Error(`Unknown tool: ${name}`);
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
      }
    });
    return server;
  }
  /**
   * 获取或创建 session。
   * 如果已有 sessionId 且存在则复用；否则创建新的。
   */
  static getOrCreateSession(sessionId, token) {
    if (sessionId && this.sessions[sessionId]) {
      return { session: this.sessions[sessionId], sessionId, isNew: false };
    }
    const newSessionId = sessionId || `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const server = this.createServer(token);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId
    });
    server.connect(transport);
    transport.onclose = () => {
      logger_default.info(`[MCP] Session ${newSessionId} closed.`);
      delete this.sessions[newSessionId];
    };
    const mcps = { transport, server, token };
    this.sessions[newSessionId] = mcps;
    logger_default.info(`[MCP] Session created: ${newSessionId}, Token: acct_${token.slice(0, 8)}`);
    return { session: mcps, sessionId: newSessionId, isNew: true };
  }
  /**
   * 处理 HTTP 请求（GET 和 POST）。
   * 路由层调用此方法，传入 Node.js 原生的 req/res + 预解析的 body。
   */
  static async handleRequest(sessionIdFromHeader, token, req, res, parsedBody) {
    const { session, sessionId, isNew } = this.getOrCreateSession(sessionIdFromHeader, token);
    await session.transport.handleRequest(req, res, parsedBody);
    if (isNew) {
      return { newSessionId: sessionId };
    }
    return {};
  }
};
var mcp_default = MCPServerManager;

// src/api/routes/mcp.ts
import _23 from "lodash";
import process3 from "process";
var DEEP_SEEK_CHAT_AUTHORIZATION4 = process3.env.DEEP_SEEK_CHAT_AUTHORIZATION;
var mcp_default2 = {
  prefix: "/mcp",
  get: {
    "": async (request) => {
      if (DEEP_SEEK_CHAT_AUTHORIZATION4) {
        request.headers.authorization = "Bearer " + DEEP_SEEK_CHAT_AUTHORIZATION4;
      }
      request.validate("headers.authorization", _23.isString);
      const tokens = chat_default.tokenSplit(request.headers.authorization);
      const clientId = getClientIdentity(request);
      const selectedToken = selectTokenForSession(tokens, `mcp:${clientId}`);
      const sessionId = request.headers["mcp-session-id"] || request.headers["x-mcp-session-id"];
      const ctx = request._ctx;
      const nativeReq = ctx.req;
      const nativeRes = ctx.res;
      const result = await mcp_default.handleRequest(
        sessionId,
        selectedToken,
        nativeReq,
        nativeRes,
        void 0
      );
      const headers = {};
      if (result.newSessionId) {
        headers["MCP-Session-Id"] = result.newSessionId;
      }
      return new Response(null, { headers });
    }
  },
  post: {
    "": async (request) => {
      if (DEEP_SEEK_CHAT_AUTHORIZATION4) {
        request.headers.authorization = "Bearer " + DEEP_SEEK_CHAT_AUTHORIZATION4;
      }
      request.validate("headers.authorization", _23.isString);
      const tokens = chat_default.tokenSplit(request.headers.authorization);
      const clientId = getClientIdentity(request);
      const selectedToken = selectTokenForSession(tokens, `mcp:${clientId}`);
      const sessionId = request.headers["mcp-session-id"] || request.headers["x-mcp-session-id"];
      const ctx = request._ctx;
      const nativeReq = ctx.req;
      const nativeRes = ctx.res;
      const result = await mcp_default.handleRequest(
        sessionId,
        selectedToken,
        nativeReq,
        nativeRes,
        request.body
      );
      const headers = {};
      if (result.newSessionId) {
        headers["MCP-Session-Id"] = result.newSessionId;
      }
      return new Response(null, { headers });
    }
  }
};

// src/api/routes/index.ts
var routes_default = [
  {
    get: {
      "/": async () => {
        const content = await fs9.readFile("public/welcome.html");
        return new Response(content, {
          type: "html",
          headers: {
            Expires: "-1"
          }
        });
      }
    }
  },
  chat_default2,
  ping_default,
  token_default,
  models_default,
  responses_default,
  messages_default,
  anthropicMessages,
  mcp_default2
];

// src/index.ts
var startupTime = performance.now();
(async () => {
  logger_default.header();
  logger_default.info("<<<< deepseek free server >>>>");
  logger_default.info("Version:", environment_default.package.version);
  logger_default.info("Process id:", process.pid);
  logger_default.info("Environment:", environment_default.env);
  logger_default.info("Service name:", config_default.service.name);
  server_default.attachRoutes(routes_default);
  await server_default.listen();
  config_default.service.bindAddress && logger_default.success("Service bind address:", config_default.service.bindAddress);
})().then(
  () => logger_default.success(
    `Service startup completed (${Math.floor(performance.now() - startupTime)}ms)`
  )
).catch((err) => console.error(err));
//# sourceMappingURL=index.mjs.map