import React, { Fragment } from "react";
import { tree, hierarchy } from "d3-hierarchy";
import { select } from "d3-selection";
import { TreeNode } from "../../store/workflows/types";
import TransitionGroupWrapper from "../feed/FeedTree/TransitionGroupWrapper";
import NodeData from "./NodeData";
import { generatePipelineWithName } from "../feed/CreateFeed/utils/pipelines";
import { getFeedTree } from "../../pages/WorkflowsPage/utils";

const nodeSize = { x: 150, y: 50 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const translate = {
  x: 150,
  y: 50,
};
const scale = 1;

const Tree = (props: { pipelineName: string }) => {
  const { pipelineName } = props;
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<TreeNode[]>();

  React.useEffect(() => {
    async function fetchResources() {
      const { resources } = await generatePipelineWithName(pipelineName);
      const { pluginPipings } = resources;
      const tree = getFeedTree(pluginPipings);
      setData(tree);
    }
    setLoading(true);
    fetchResources();
    setLoading(false);
  }, [pipelineName]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes;
    let links = undefined;
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
    }
    return { nodes, links };
  };

  const { nodes, links } = generateTree();

  return (
    <div>
      {loading ? (
        <span style={{ color: "black" }}>Fetching Pipeline.....</span>
      ) : (
        <svg className={`${svgClassName}`} width="100%" height="100%">
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => {
              return (
                <LinkData
                  orientation="vertical"
                  key={"link" + i}
                  linkData={linkData}
                />
              );
            })}
            {nodes?.map(({ data, x, y, parent }, i) => {
              return (
                <NodeData
                  key={`node + ${i}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  orientation="vertical"
                  handleNodeClick={() => {
                    console.log("Clicked");
                  }}
                  currentPipelineId={1}
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      )}
    </div>
  );
};
interface LinkProps {
  linkData: any;
  key: string;
  orientation: "vertical";
}

type LinkState = {
  initialStyle: {
    opacity: number;
  };
};

class LinkData extends React.Component<LinkProps, LinkState> {
  private linkRef: SVGPathElement | null = null;
  state = {
    initialStyle: {
      opacity: 0,
    },
  };
  componentDidMount() {
    this.applyOpacity(1, 0);
  }
  componentWillLeave(done: () => null) {
    this.applyOpacity(1, 0, done);
  }

  applyOpacity(
    opacity: number,
    transitionDuration: number,
    done = () => {
      return null;
    }
  ) {
    select(this.linkRef).style("opacity", opacity).on("end", done);
  }

  nodeRadius = 12;

  drawPath = () => {
    const { linkData, orientation } = this.props;

    const { source, target } = linkData;

    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = this.nodeRadius,
      targetPadding = this.nodeRadius + 4,
      sourceX = source.x + sourcePadding * normX,
      sourceY = source.y + sourcePadding * normY,
      targetX = target.x - targetPadding * normX,
      targetY = target.y - targetPadding * normY;

    //@ts-ignore

    return orientation === "horizontal"
      ? `M ${sourceY} ${sourceX} L ${targetY} ${targetX}`
      : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };
  render() {
    const { linkData } = this.props;
    return (
      <Fragment>
        <path
          ref={(l) => {
            this.linkRef = l;
          }}
          className="link"
          d={this.drawPath()}
          style={{ ...this.state.initialStyle }}
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
        />
      </Fragment>
    );
  }
}

export default Tree;
