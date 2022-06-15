"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatestBlock = exports.EndOfEvents = exports.EventType = exports.Abi = void 0;
var Abi;
(function (Abi) {
    Abi["Transfer"] = "event Transfer(address indexed from, address indexed to, uint256 value)";
    Abi["BalanceOf"] = "function balanceOf(address owner) view returns (uint256)";
    Abi["TotalSupply"] = "function totalSupply() view returns (uint256)";
    Abi["GetReserves"] = "function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)";
    Abi["Token0"] = "function token0() view returns (address)";
    Abi["Token1"] = "function token1() view returns (address)";
})(Abi = exports.Abi || (exports.Abi = {}));
var EventType;
(function (EventType) {
    EventType["Transfer"] = "Transfer";
    EventType["Burn"] = "Burn";
    EventType["Mint"] = "Mint";
})(EventType = exports.EventType || (exports.EventType = {}));
exports.EndOfEvents = { eoe: true };
exports.LatestBlock = 'latest';
//# sourceMappingURL=interface.js.map