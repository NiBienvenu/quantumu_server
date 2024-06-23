
const { op } = require('sequelize');
const Ubuntu = require('../models/Ubuntu');
const { Client } = require('ssh2');


// create ubuntu


const machines = [
    { host: '192.168.1.10', username: 'edgar', password: '12Edgar', sudoPassword: '12Edgar' },
];

const script = `              
TAP_DEV="tap0"
TAP_IP="172.16.0.1"
MASK_SHORT="/30"

# Setup network interface
sudo -S ip link del "\${TAP_DEV}" 2> /dev/null || true
sudo -S ip tuntap add dev "\${TAP_DEV}" mode tap
sudo -S ip addr add "\${TAP_IP}\${MASK_SHORT}" dev "\${TAP_DEV}"
sudo -S ip link set dev "\${TAP_DEV}" up

# Enable ip forwarding
sudo -S sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

HOST_IFACE="eth0"

# Set up microVM internet access
sudo -S iptables -t nat -D POSTROUTING -o "\${HOST_IFACE}" -j MASQUERADE || true
sudo -S iptables -D FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT || true
sudo -S iptables -D FORWARD -i tap0 -o "\${HOST_IFACE}" -j ACCEPT || true
sudo -S iptables -t nat -A POSTROUTING -o "\${HOST_IFACE}" -j MASQUERADE
sudo -S iptables -I FORWARD 1 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo -S iptables -I FORWARD 1 -i tap0 -o "\${HOST_IFACE}" -j ACCEPT

API_SOCKET="/tmp/firecracker.socket"
LOGFILE="./firecracker.log"

# Create log file
touch \${LOGFILE}

# Set log file
sudo -S curl -X PUT --unix-socket "\${API_SOCKET}" --data '{
    "log_path": "\${LOGFILE}",
    "level": "Debug",
    "show_level": true,
    "show_log_origin": true
}' "http://localhost/logger"

KERNEL="./vmlinux-5.10.217"
KERNEL_BOOT_ARGS="console=ttyS0 reboot=k panic=1 pci=off"

ARCH=$(uname -m)

if [ \${ARCH} = "aarch64" ]; then
    KERNEL_BOOT_ARGS="keep_bootcon \${KERNEL_BOOT_ARGS}"
fi

# Set boot source
sudo -S curl -X PUT --unix-socket "\${API_SOCKET}" --data '{
    "kernel_image_path": "\${KERNEL}",
    "boot_args": "\${KERNEL_BOOT_ARGS}"
}' "http://localhost/boot-source"

ROOTFS="./ubuntu-22.04.ext4"

# Set rootfs
sudo -S curl -X PUT --unix-socket "\${API_SOCKET}" --data '{
    "drive_id": "rootfs",
    "path_on_host": "\${ROOTFS}",
    "is_root_device": true,
    "is_read_only": false
}' "http://localhost/drives/rootfs"

FC_MAC="06:00:AC:10:00:02"

# Set network interface
sudo -S curl -X PUT --unix-socket "\${API_SOCKET}" --data '{
    "iface_id": "net1",
    "guest_mac": "\${FC_MAC}",
    "host_dev_name": "\${TAP_DEV}"
}' "http://localhost/network-interfaces/net1"

# API requests are handled asynchronously, it is important the configuration is set, before \`InstanceStart\`.
sleep 0.015s

# Start microVM
sudo -S curl -X PUT --unix-socket "\${API_SOCKET}" --data '{
    "action_type": "InstanceStart"
}' "http://localhost/actions"

# API requests are handled asynchronously, it is important the microVM has been started before we attempt to SSH into it.
sleep 2s

# Setup internet access in the guest
ssh -i ./ubuntu-22.04.id_rsa root@172.16.0.2 "ip route add default via 172.16.0.1 dev eth0"

# Setup DNS resolution in the guest
ssh -i ./ubuntu-22.04.id_rsa root@172.16.0.2 "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"

# SSH into the microVM
ssh -i ./ubuntu-22.04.id_rsa root@172.16.0.2

# Use \`root\` for both the login and password.
# Run \`reboot\` to exit.
`;

async function executeScript(machine) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log(`Connected to ${machine.host}`);
            conn.exec(`echo '${machine.sudoPassword}' | sudo -S sh -c "echo '${script}' > /home/${machine.username}/firecracker/firecracker_setup.sh && chmod +x /home/${machine.username}/firecracker/firecracker_setup.sh && /home/${machine.username}/firecracker/firecracker_setup.sh"`, (err, stream) => {
                if (err) {
                    reject(`Failed to execute script on ${machine.host}: ${err.message}`);
                }
                stream.on('close', (code, signal) => {
                    if (code === 0) {
                        resolve(`Script executed successfully on ${machine.host}`);
                    } else {
                        reject(`Script failed on ${machine.host} with code: ${code}, signal: ${signal}`);
                    }
                    conn.end();
                }).on('data', (data) => {
                    console.log(`STDOUT: ${data}`);
                }).stderr.on('data', (data) => {
                    console.log(`STDERR: ${data}`);
                });
            });
        }).on('error', (err) => {
            reject(`Failed to connect to ${machine.host}: ${err.message}`);
        }).connect({
            host: machine.host,
            port: 22,
            username: machine.username,
            password: machine.password
        });
    });
}

const addUbuntu = async (req, res) => {
    try {
        for (const machine of machines) {
            try {
                const result = await executeScript(machine);
                console.log(result);
            } catch (error) {
                console.error(error);
            }
        }
        res.status(200).send({ message: "Script executed on all machines" });
    } catch (error) {
        console.log('error: ' + error);
        res.status(500).send({
            message: error.message,
        });
    }
}
const ShowOneUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    const ubuntu = await Ubuntu.findOne({ where: { ID: id } }).then(ubuntu => {
      res.status(200).json(ubuntu);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }

};

const FindAllUbuntu = async (req, res) => {
  try {
    const ubuntu= await Ubuntu.findAll()

    res.status(200).json({
      statusCode: 200,
      httpStatus: 200,
      message: "all ubuntu devices",
      result: ubuntu
}) 
    
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const UpdateUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    let info = req.body;
    const ubuntu = await Ubuntu.update(info, { where: { ID: id } }).then(ubuntu => {
      res.status(200).send(ubuntu);
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const DeleteUbuntu = async (req, res) => {
  try {
    let id = req.params.id;
    const ubuntu = await Ubuntu.destroy({ where: { ID: id } })
    res.status(200).send(ubuntu);
    
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
}


module.exports = {
  addUbuntu,
  ShowOneUbuntu,
  FindAllUbuntu,
  UpdateUbuntu,
  DeleteUbuntu,

};
