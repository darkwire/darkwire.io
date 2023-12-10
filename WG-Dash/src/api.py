import ipaddress, subprocess, datetime, os, util
from util import *

notEnoughParameter = {"status": False, "reason": "Please provide all required parameters."}
good = {"status": True, "reason": ""}

def ret(status=True, reason="", data=""):
    return {"status": status, "reason": reason, "data": data}

def togglePeerAccess(data, g):
    checkUnlock = g.cur.execute(f"SELECT * FROM {data['config']} WHERE id='{data['peerID']}'").fetchone()
    if checkUnlock:
        moveUnlockToLock = g.cur.execute(
            f"INSERT INTO {data['config']}_restrict_access SELECT * FROM {data['config']} WHERE id = '{data['peerID']}'")
        if g.cur.rowcount == 1:
            print(g.cur.rowcount)
            print(util.deletePeers(data['config'], [data['peerID']], g.cur, g.db))
    else:
        moveLockToUnlock = g.cur.execute(
            f"SELECT * FROM {data['config']}_restrict_access WHERE id = '{data['peerID']}'").fetchone()
        try:
            if len(moveLockToUnlock[-1]) == 0:
                status = subprocess.check_output(
                    f"wg set {data['config']} peer {moveLockToUnlock[0]} allowed-ips {moveLockToUnlock[11]}",
                    shell=True, stderr=subprocess.STDOUT)
            else:
                now = str(datetime.datetime.now().strftime("%m%d%Y%H%M%S"))
                f_name = now + "_tmp_psk.txt"
                f = open(f_name, "w+")
                f.write(moveLockToUnlock[-1])
                f.close()
                subprocess.check_output(
                    f"wg set {data['config']} peer {moveLockToUnlock[0]} allowed-ips {moveLockToUnlock[11]} preshared-key {f_name}",
                    shell=True, stderr=subprocess.STDOUT)
                os.remove(f_name)
            status = subprocess.check_output(f"wg-quick save {data['config']}", shell=True, stderr=subprocess.STDOUT)
            g.cur.execute(
                f"INSERT INTO {data['config']} SELECT * FROM {data['config']}_restrict_access WHERE id = '{data['peerID']}'")
            if g.cur.rowcount == 1:
                g.cur.execute(f"DELETE FROM {data['config']}_restrict_access WHERE id = '{data['peerID']}'")

        except subprocess.CalledProcessError as exc:
            return {"status": False, "reason": str(exc.output.strip())}
    return good



class settings:
    def setTheme(self, theme, config, setConfig):
        themes = ['light', 'dark']
        if theme not in themes: 
            return ret(status=False, reason="Theme does not exist")
        config['Server']['dashboard_theme'] = theme
        setConfig(config)
        return ret()