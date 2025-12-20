# 原始数据地址（GitHub Raw）
let raw_url = "https://raw.githubusercontent.com/MiyakoMeow/bms-table-mirror/main/outputs/tables_github.json"

# 基准路径（相对本脚本文件）
let script_root = (
  if (($env | get -o FILE_PWD) != null) { $env.FILE_PWD } else { $env.PWD }
)

# JSON 存放目录（保持原目录）与文件路径
let json_dir = ($script_root | path join "../public/bms/table-mirror")
let dest = ($json_dir | path join "tables_github.json")

# 反代列表（按此列表进行测速与选择）
let proxies = [
  "https://proxy.pipers.cn/",
  "https://gh.llkk.cc/"
]

# 数据类型定义：
# ProxyTiming: { proxy: string, url: string, time: duration }
# BestProxyResult: { best_proxy: string, best_url: string, timings: list<ProxyTiming> }

# 进行反代测速并返回最佳结果（及所有成功的记录）
def median-duration [ds: list<any>] {
  let n = ($ds | length)
  if $n == 0 { null } else {
    let sorted = ($ds | sort)
    let mid = ($n // 2)
    $sorted | get $mid
  }
}

def speedtest-proxies [raw_url: string, proxies: list<string>] {
  let timings = (
    $proxies | each { |p|
      let u = $"($p)($raw_url)"
      let samples = (
        1..3 | each { ||
          let start = (date now)
          let status = (try {
            let _ = (^curl -sSLI --fail -o - -L $u | lines | length)
            "ok"
          } catch { "fail" })
          if $status == "ok" {
            let end = (date now)
            ($end - $start)
          } else { null }
        } | compact
      )
      let m = (median-duration $samples)
      if $m == null { null } else {
        { proxy: $p, url: $u, time: $m, samples: $samples }
      }
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

print "speedtest result"
print ($result | to toml)

# 输出所有成功记录的耗时
$result.timings | each { |r| print ($r | to toml) }

# 若没有任何成功记录则直接退出
let count = ($result.timings | length)
if $count == 0 {
  print "no proxy succeeded, abort"
  exit 1
}

# 有成功记录再删除并创建目录
if ($json_dir | path exists) { rm -r $json_dir }
mkdir $json_dir

print $"best proxy: ($result.best_proxy)"
print $"best url: ($result.best_url)"
^curl -sSL --fail -L $result.best_url -o $dest

let items = (open --raw $dest | from json)

let site_base = "https://miyakomeow.github.io/bms/table-mirror/"
def encode-component [s: string] { $s | url encode --all }

let tables_out = ($json_dir | path join "tables.json")
$items | each { |it|
  let encoded_dir = (encode-component $it.dir_name)
  ($it | upsert url $"($site_base)($encoded_dir)/")
} | to json | save -f $tables_out

let tables_proxy_out = ($json_dir | path join "tables_proxy.json")
$items | each { |it|
  ($it | upsert url $"($result.best_proxy)($it.url)")
} | to json | save -f $tables_proxy_out
