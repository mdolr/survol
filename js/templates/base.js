/* Hover classes bound themselves to a node
 * The baseHover is designed for non-recognized link (still need to identify legit links without applying the class to buttons etc..)
 */
class BaseHover {
    constructor(node) {
        this.boundNode = node;
    }
}