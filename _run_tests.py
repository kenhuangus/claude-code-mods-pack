import subprocess
import sys
from pathlib import Path

ROOT = Path(r"C:\Users\kenhu\claude-code-mods-pack\mods")
claude = r"C:\Users\kenhu\.local\bin\claude.exe"
results = []

for mod in sorted(ROOT.iterdir()):
    if not mod.is_dir():
        continue
    print("=" * 60, mod.name, flush=True)
    v = subprocess.run([claude, "plugin", "validate", str(mod)], capture_output=True, text=True)
    print(v.stdout)
    print(v.stderr)
    t = subprocess.run([claude, "plugin", "test", str(mod)], capture_output=True, text=True)
    print(t.stdout)
    print(t.stderr)
    ok = v.returncode == 0 and t.returncode == 0 and "fail" not in t.stdout.lower().split("pass")[-1] if False else (v.returncode == 0 and t.returncode == 0)
    # parse fail count
    failed = "fail" in (t.stdout + t.stderr) and "0 fail" not in (t.stdout + t.stderr)
    results.append((mod.name, v.returncode, t.returncode, failed, t.stdout[-500:]))

print("\n\nSUMMARY")
all_ok = True
for name, vc, tc, failed, tail in results:
    status = "OK" if vc == 0 and tc == 0 and not failed else "FAIL"
    if status != "OK":
        all_ok = False
    print(f"{status:4} {name:20} validate={vc} test={tc}")
    if status != "OK":
        print(tail)

sys.exit(0 if all_ok else 1)
