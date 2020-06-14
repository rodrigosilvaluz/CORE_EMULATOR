import logging

from core.emulator.coreemu import CoreEmu
from core.emulator.emudata import IpPrefixes, NodeOptions
from core.emulator.enumerations import EventTypes
from core.nodes.base import CoreNode
from core.nodes.docker import DockerNode
from core.nodes.network import SwitchNode

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)

    coreemu = CoreEmu()
    session = coreemu.create_session()
    session.set_state(EventTypes.CONFIGURATION_STATE)

    try:
        prefixes = IpPrefixes(ip4_prefix="10.83.0.0/16")
        options = NodeOptions(model=None, image="ubuntu")

        # create switch
        switch = session.add_node(SwitchNode)

        # node one
        node1 = session.add_node(DockerNode, options=options)
        interface1_data = prefixes.create_interface(node1)

        # node two
        node2 = session.add_node(DockerNode, options=options)
        interface2_data = prefixes.create_interface(node2)

        # node three
        node_three = session.add_node(CoreNode)
        interface_three = prefixes.create_interface(node_three)

        # add links
        session.add_link(node1.id, switch.id, interface1_data)
        session.add_link(node2.id, switch.id, interface2_data)
        session.add_link(node_three.id, switch.id, interface_three)

        # instantiate
        session.instantiate()
    finally:
        input("continue to shutdown")
        coreemu.shutdown()
