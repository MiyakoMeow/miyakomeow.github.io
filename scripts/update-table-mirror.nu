# 原始数据地址（GitHub Raw）
let raw_url = "https://raw.githubusercontent.com/MiyakoMeow/bms-table-mirror/main/outputs/tables_github.json"

# 基准路径（相对本脚本文件）
let script_root = (
  if (($env | get -o FILE_PWD) != null) { $env.FILE_PWD } else { $env.PWD }
)

# JSON 存放目录（保持原目录）与文件路径
let json_dir = ($script_root | path join "../public/bms/table-mirror")
let dest = ($json_dir | path join "tables_github.json")

# 页面生成目录（改为 entry/bms/table-mirror）
let pages_dir = ($script_root | path join "../entry/bms/table-mirror")

# 反代列表（按此列表进行测速与选择）
let proxies = [
  "https://proxy.pipers.cn/",
  "https://gh.llkk.cc/",
  "https://gh-proxy.com/"
]

# 数据类型定义：
# ProxyTiming: { proxy: string, url: string, time: duration }
# BestProxyResult: { best_proxy: string, best_url: string, timings: list<ProxyTiming> }

# 进行反代测速并返回最佳结果（及所有成功的记录）
def speedtest-proxies [raw_url: string, proxies: list<string>] {
  let timings = (
    $proxies | each { |p|
      let u = $"($p)($raw_url)"
      let start = (date now)
      let status = (try { ^curl -sSL --fail -o NUL -L $u; "ok" } catch { "fail" })
      if $status == "ok" {
        let end = (date now)
        { proxy: $p, url: $u, time: ($end - $start) }
      } else { null }
    } | compact
  )
  if ($timings | length) == 0 {
    { best_proxy: null, best_url: null, timings: [] }
  } else {
    let best = ($timings | sort-by time | first)
    { best_proxy: $best.proxy, best_url: $best.url, timings: $timings }
  }
}

let result = (speedtest-proxies $raw_url $proxies)

# 输出所有成功记录的耗时
$result.timings | each { |r| print $r }

# 若没有任何成功记录则直接退出
let count = ($result.timings | length)
if $count == 0 {
  print "no proxy succeeded, abort"
  exit 1
}

# 有成功记录再删除并创建目录
if ($json_dir | path exists) { rm -r $json_dir }
mkdir $json_dir

if ($pages_dir | path exists) {
  ls $pages_dir | where type == "dir" | get name | each { |n|
    rm -r ($pages_dir | path join $n)
  }
} else {
  mkdir $pages_dir
}

print $"best proxy: ($result.best_proxy)"
print $"best url: ($result.best_url)"
^curl -sSL --fail -L $result.best_url -o $dest

let items = (open --raw $dest | from json)
let tpl_path = ($script_root | path join "../entry/bms/self-table-sp/index.html")
let tpl = (open --raw $tpl_path | into string)

print "generating index pages"
$items | each { |it|
  let dir = ($pages_dir | path join $it.dir_name)
  mkdir $dir
  let header_link = $"($result.best_proxy)($it.url)"
  let out = ($tpl
    | str replace -a "./header.json" $header_link
    | str replace "../../../src/pages/BMSTable.vue" "../../../../src/pages/BMSTable.vue"
  )
  $out | save -f ($dir | path join "index.html")
}
