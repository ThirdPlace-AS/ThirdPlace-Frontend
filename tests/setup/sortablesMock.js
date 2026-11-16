// react-native-sortables under Jest (see nativeMocks.js): a Grid renders its
// rows in order, Flex and Handle render their children.
const React = require("react");
const { View } = require("react-native");

const Grid = ({ data, renderItem, keyExtractor }) =>
  React.createElement(
    View,
    null,
    data.map((item, index) =>
      React.createElement(
        View,
        { key: keyExtractor(item) },
        renderItem({ item, index }),
      ),
    ),
  );
const Flex = ({ children }) => React.createElement(View, null, children);
const Handle = ({ children }) => children;

module.exports = { __esModule: true, default: { Grid, Flex, Handle } };
