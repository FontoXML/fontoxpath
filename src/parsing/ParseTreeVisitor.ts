import { IAST } from './astHelper';
import {
	AbbrevForwardStepContext,
	AbbrevReverseStepContext,
	AdditiveExprContext,
	AllNamesContext,
	AllowingEmptyContext,
	AllWithLocalContext,
	AllWithNSContext,
	AndExprContext,
	AnnotationContext,
	AnnotationParamContext,
	AnnotationsContext,
	AnnotListContext,
	AnyArrayTestContext,
	AnyFunctionTestContext,
	AnyKindTestContext,
	AnyMapTestContext,
	ArgumentContext,
	ArgumentListContext,
	ArrayConstructorContext,
	ArrayTestContext,
	ArrowExprContext,
	ArrowFunctionSpecifierContext,
	AtomicOrUnionTypeContext,
	AttributeDeclarationContext,
	AttributeNameContext,
	AttributeNameOrWildcardContext,
	AttributeTestContext,
	AxisStepContext,
	BaseURIDeclContext,
	BinaryNodeTestContext,
	BoundarySpaceDeclContext,
	CaseClauseContext,
	CastableExprContext,
	CastExprContext,
	CatchClauseContext,
	CatchErrorListContext,
	CharNoGraveContext,
	CharNoLBraceContext,
	CharNoRBrackContext,
	CommentTestContext,
	CommonContentContext,
	ComparisonExprContext,
	CompAttrConstructorContext,
	CompBinaryConstructorContext,
	CompCommentConstructorContext,
	CompDocConstructorContext,
	CompElemConstructorContext,
	CompMLJSONArrayConstructorContext,
	CompMLJSONBooleanConstructorContext,
	CompMLJSONConstructorContext,
	CompMLJSONNullConstructorContext,
	CompMLJSONNumberConstructorContext,
	CompMLJSONObjectConstructorContext,
	CompNamespaceConstructorContext,
	CompPIConstructorContext,
	CompTextConstructorContext,
	ComputedConstructorContext,
	ConstructionDeclContext,
	ContextItemDeclContext,
	ContextItemExprContext,
	CopyNamespacesDeclContext,
	CountClauseContext,
	CurlyArrayConstructorContext,
	DecimalFormatDeclContext,
	DefaultCollationDeclContext,
	DefaultNamespaceDeclContext,
	DirAttributeContentAposContext,
	DirAttributeContentQuotContext,
	DirAttributeListContext,
	DirAttributeValueAposContext,
	DirAttributeValueContext,
	DirAttributeValueQuotContext,
	DirectConstructorContext,
	DirElemConstructorOpenCloseContext,
	DirElemConstructorSingleTagContext,
	DirElemContentContext,
	DocumentTestContext,
	ElementDeclarationContext,
	ElementNameContext,
	ElementNameOrWildcardContext,
	ElementTestContext,
	EmptyOrderDeclContext,
	EnclosedContentExprContext,
	EnclosedExpressionContext,
	EnclosedPrefixExprContext,
	EnclosedTryTargetExpressionContext,
	EnclosedURIExprContext,
	EqNameContext,
	ExistDeleteExprContext,
	ExistInsertExprContext,
	ExistRenameExprContext,
	ExistReplaceExprContext,
	ExistUpdateExprContext,
	ExistValueExprContext,
	ExprContext,
	ExprSingleContext,
	ExtensionExprContext,
	FlworExprContext,
	ForBindingContext,
	ForClauseContext,
	ForwardAxisContext,
	ForwardStepContext,
	FunctionBodyContext,
	FunctionCallContext,
	FunctionDeclContext,
	FunctionItemExprContext,
	FunctionNameContext,
	FunctionParamContext,
	FunctionParamsContext,
	FunctionReturnContext,
	FunctionTestContext,
	GeneralCompContext,
	GroupByClauseContext,
	GroupingSpecContext,
	GroupingSpecListContext,
	IfExprContext,
	InheritModeContext,
	InitialClauseContext,
	InlineFunctionRefContext,
	InstanceOfExprContext,
	IntermediateClauseContext,
	IntersectExceptExprContext,
	ItemTypeContext,
	KeySpecifierContext,
	KeywordContext,
	KeywordNotOKForFunctionContext,
	KeywordOKForFunctionContext,
	KindTestContext,
	LetBindingContext,
	LetClauseContext,
	LibraryModuleContext,
	LiteralContext,
	LookupContext,
	MainModuleContext,
	MapConstructorContext,
	MapConstructorEntryContext,
	MapTestContext,
	MlArrayNodeTestContext,
	MlBooleanNodeTestContext,
	MlNodeTestContext,
	MlNullNodeTestContext,
	MlNumberNodeTestContext,
	MlObjectNodeTestContext,
	ModuleContext,
	ModuleDeclContext,
	ModuleImportContext,
	MultiplicativeExprContext,
	NamedFunctionRefContext,
	NamespaceDeclContext,
	NamespaceNodeTestContext,
	NameTestContext,
	NcNameContext,
	NodeCompContext,
	NodeConstructorContext,
	NodeTestContext,
	NoQuotesNoBracesNoAmpNoLAngContext,
	NumericLiteralContext,
	OptionDeclContext,
	OrderByClauseContext,
	OrderedExprContext,
	OrderingModeDeclContext,
	OrderSpecContext,
	OrExprContext,
	ParenthesizedExprContext,
	ParenthesizedItemTestContext,
	PathExprContext,
	PiTestContext,
	PositionalVarContext,
	PostfixExprContext,
	PredicateContext,
	PredicateListContext,
	PrefixContext,
	PreserveModeContext,
	PrimaryExprContext,
	PrologContext,
	QNameContext,
	QuantifiedExprContext,
	QuantifiedVarContext,
	QueryBodyContext,
	RangeExprContext,
	RelativePathExprContext,
	ReturnClauseContext,
	ReverseAxisContext,
	ReverseStepContext,
	SchemaAttributeTestContext,
	SchemaElementTestContext,
	SchemaImportContext,
	SchemaPrefixContext,
	SequenceTypeContext,
	SequenceUnionTypeContext,
	SetterContext,
	SimpleMapExprContext,
	SimpleTypeNameContext,
	SingleTypeContext,
	SlidingWindowClauseContext,
	SquareArrayConstructorContext,
	StepExprContext,
	StringConcatExprContext,
	StringConstructorCharsContext,
	StringConstructorContentContext,
	StringConstructorContext,
	StringConstructorInterpolationContext,
	StringContentAposContext,
	StringContentQuotContext,
	StringLiteralAposContext,
	StringLiteralContext,
	StringLiteralQuotContext,
	SwitchCaseClauseContext,
	SwitchCaseOperandContext,
	SwitchExprContext,
	TextTestContext,
	TreatExprContext,
	TryCatchExprContext,
	TryClauseContext,
	TumblingWindowClauseContext,
	TypedArrayTestContext,
	TypeDeclarationContext,
	TypedFunctionTestContext,
	TypedMapTestContext,
	TypeNameContext,
	TypeswitchExprContext,
	UnaryExpressionContext,
	UnaryLookupContext,
	UnionExprContext,
	UnorderedExprContext,
	UriLiteralContext,
	ValidateExprContext,
	ValidationModeContext,
	ValueCompContext,
	ValueExprContext,
	VarDeclContext,
	VarDefaultValueContext,
	VarNameContext,
	VarRefContext,
	VarValueContext,
	VersionDeclContext,
	WhereClauseContext,
	WildcardContext,
	WindowClauseContext,
	WindowEndConditionContext,
	WindowStartConditionContext,
	WindowVarsContext,
	XqDocCommentContext,
} from './XQueryParser';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';

function binaryOp<TType extends ParserRuleContext>(
	astType: string,
	children: TType[],
	visitChild: (child: TType) => IAST
): IAST {
	if (children.length === 1) {
		return visitChild(children[0]);
	}
	return [astType, ...children.map(visitChild)];
}

function visitAllNames(ctx: AllNamesContext): IAST {
	throw new Error('Not implemented');
}
function visitAllWithNS(ctx: AllWithNSContext): IAST {
	throw new Error('Not implemented');
}
function visitAllWithLocal(ctx: AllWithLocalContext): IAST {
	throw new Error('Not implemented');
}
export function visitModule(ctx: ModuleContext): IAST {
	return ['module', visitMainModule(ctx.mainModule(0))];
}
function visitXqDocComment(ctx: XqDocCommentContext): IAST {
	throw new Error('Not implemented');
}
function visitVersionDecl(ctx: VersionDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitMainModule(ctx: MainModuleContext): IAST {
	return ['mainModule', visitQueryBody(ctx.queryBody())];
}
function visitQueryBody(ctx: QueryBodyContext): IAST {
	return visitExpr(ctx.expr());
}
function visitLibraryModule(ctx: LibraryModuleContext): IAST {
	throw new Error('Not implemented');
}
function visitModuleDecl(ctx: ModuleDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitProlog(ctx: PrologContext): IAST {
	throw new Error('Not implemented');
}
function visitDefaultNamespaceDecl(ctx: DefaultNamespaceDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitSetter(ctx: SetterContext): IAST {
	throw new Error('Not implemented');
}
function visitBoundarySpaceDecl(ctx: BoundarySpaceDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitDefaultCollationDecl(ctx: DefaultCollationDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitBaseURIDecl(ctx: BaseURIDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitConstructionDecl(ctx: ConstructionDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitOrderingModeDecl(ctx: OrderingModeDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitEmptyOrderDecl(ctx: EmptyOrderDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitCopyNamespacesDecl(ctx: CopyNamespacesDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitPreserveMode(ctx: PreserveModeContext): IAST {
	throw new Error('Not implemented');
}
function visitInheritMode(ctx: InheritModeContext): IAST {
	throw new Error('Not implemented');
}
function visitDecimalFormatDecl(ctx: DecimalFormatDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitSchemaImport(ctx: SchemaImportContext): IAST {
	throw new Error('Not implemented');
}
function visitSchemaPrefix(ctx: SchemaPrefixContext): IAST {
	throw new Error('Not implemented');
}
function visitModuleImport(ctx: ModuleImportContext): IAST {
	throw new Error('Not implemented');
}
function visitNamespaceDecl(ctx: NamespaceDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitVarDecl(ctx: VarDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitVarValue(ctx: VarValueContext): IAST {
	throw new Error('Not implemented');
}
function visitVarDefaultValue(ctx: VarDefaultValueContext): IAST {
	throw new Error('Not implemented');
}
function visitContextItemDecl(ctx: ContextItemDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionDecl(ctx: FunctionDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionParams(ctx: FunctionParamsContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionParam(ctx: FunctionParamContext): IAST {
	throw new Error('Not implemented');
}
function visitAnnotations(ctx: AnnotationsContext): IAST {
	throw new Error('Not implemented');
}
function visitAnnotation(ctx: AnnotationContext): IAST {
	throw new Error('Not implemented');
}
function visitAnnotList(ctx: AnnotListContext): IAST {
	throw new Error('Not implemented');
}
function visitAnnotationParam(ctx: AnnotationParamContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionReturn(ctx: FunctionReturnContext): IAST {
	throw new Error('Not implemented');
}
function visitOptionDecl(ctx: OptionDeclContext): IAST {
	throw new Error('Not implemented');
}
function visitExpr(ctx: ExprContext): IAST {
	debugger;
	if (ctx.exprSingle() !== undefined) {
		if (ctx.exprSingle().length === 1) {
			return visitExprSingle(ctx.exprSingle(0));
		} else {
			throw new Error('Not implemented');
		}
	} else if (ctx.COMMA() !== undefined) {
		throw new Error('Not implemented');
	}
}
function visitExprSingle(ctx: ExprSingleContext): IAST {
	const child = ctx.children[0];
	const y = child.payload;
	if (ctx.orExpr() !== undefined) {
		return visitOrExpr(ctx.orExpr());
	} else {
		throw new Error('Not implemented');
	}
}
function visitFlworExpr(ctx: FlworExprContext): IAST {
	throw new Error('Not implemented');
}
function visitInitialClause(ctx: InitialClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitIntermediateClause(ctx: IntermediateClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitForClause(ctx: ForClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitForBinding(ctx: ForBindingContext): IAST {
	throw new Error('Not implemented');
}
function visitAllowingEmpty(ctx: AllowingEmptyContext): IAST {
	throw new Error('Not implemented');
}
function visitPositionalVar(ctx: PositionalVarContext): IAST {
	throw new Error('Not implemented');
}
function visitLetClause(ctx: LetClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitLetBinding(ctx: LetBindingContext): IAST {
	throw new Error('Not implemented');
}
function visitWindowClause(ctx: WindowClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitTumblingWindowClause(ctx: TumblingWindowClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitSlidingWindowClause(ctx: SlidingWindowClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitWindowStartCondition(ctx: WindowStartConditionContext): IAST {
	throw new Error('Not implemented');
}
function visitWindowEndCondition(ctx: WindowEndConditionContext): IAST {
	throw new Error('Not implemented');
}
function visitWindowVars(ctx: WindowVarsContext): IAST {
	throw new Error('Not implemented');
}
function visitCountClause(ctx: CountClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitWhereClause(ctx: WhereClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitGroupByClause(ctx: GroupByClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitGroupingSpecList(ctx: GroupingSpecListContext): IAST {
	throw new Error('Not implemented');
}
function visitGroupingSpec(ctx: GroupingSpecContext): IAST {
	throw new Error('Not implemented');
}
function visitOrderByClause(ctx: OrderByClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitOrderSpec(ctx: OrderSpecContext): IAST {
	throw new Error('Not implemented');
}
function visitReturnClause(ctx: ReturnClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitQuantifiedExpr(ctx: QuantifiedExprContext): IAST {
	throw new Error('Not implemented');
}
function visitQuantifiedVar(ctx: QuantifiedVarContext): IAST {
	throw new Error('Not implemented');
}
function visitSwitchExpr(ctx: SwitchExprContext): IAST {
	throw new Error('Not implemented');
}
function visitSwitchCaseClause(ctx: SwitchCaseClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitSwitchCaseOperand(ctx: SwitchCaseOperandContext): IAST {
	throw new Error('Not implemented');
}
function visitTypeswitchExpr(ctx: TypeswitchExprContext): IAST {
	throw new Error('Not implemented');
}
function visitCaseClause(ctx: CaseClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitSequenceUnionType(ctx: SequenceUnionTypeContext): IAST {
	throw new Error('Not implemented');
}
function visitIfExpr(ctx: IfExprContext): IAST {
	throw new Error('Not implemented');
}
function visitTryCatchExpr(ctx: TryCatchExprContext): IAST {
	throw new Error('Not implemented');
}
function visitTryClause(ctx: TryClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitEnclosedTryTargetExpression(ctx: EnclosedTryTargetExpressionContext): IAST {
	throw new Error('Not implemented');
}
function visitCatchClause(ctx: CatchClauseContext): IAST {
	throw new Error('Not implemented');
}
function visitEnclosedExpression(ctx: EnclosedExpressionContext): IAST {
	throw new Error('Not implemented');
}
function visitCatchErrorList(ctx: CatchErrorListContext): IAST {
	throw new Error('Not implemented');
}
function visitExistUpdateExpr(ctx: ExistUpdateExprContext): IAST {
	throw new Error('Not implemented');
}
function visitExistReplaceExpr(ctx: ExistReplaceExprContext): IAST {
	throw new Error('Not implemented');
}
function visitExistValueExpr(ctx: ExistValueExprContext): IAST {
	throw new Error('Not implemented');
}
function visitExistInsertExpr(ctx: ExistInsertExprContext): IAST {
	throw new Error('Not implemented');
}
function visitExistDeleteExpr(ctx: ExistDeleteExprContext): IAST {
	throw new Error('Not implemented');
}
function visitExistRenameExpr(ctx: ExistRenameExprContext): IAST {
	throw new Error('Not implemented');
}
function visitOrExpr(ctx: OrExprContext): IAST {
	return binaryOp('orExpr', ctx.andExpr(), visitAndExpr);
}
function visitAndExpr(ctx: AndExprContext): IAST {
	return binaryOp('andExpr', ctx.comparisonExpr(), visitComparisonExpr);
}
function visitComparisonExpr(ctx: ComparisonExprContext): IAST {
	if (ctx.valueComp()) {
		return binaryOp('valueCompare', ctx.stringConcatExpr(), visitStringConcatExpr);
	} else if (ctx.generalComp()) {
		return binaryOp('generalCompare', ctx.stringConcatExpr(), visitStringConcatExpr);
	} else if (ctx.nodeComp()) {
		return binaryOp('nodeCompare', ctx.stringConcatExpr(), visitStringConcatExpr);
	} else {
		return visitStringConcatExpr(ctx.stringConcatExpr()[0]);
	}
}
function visitStringConcatExpr(ctx: StringConcatExprContext): IAST {
	return binaryOp('stringConcatenateOp', ctx.rangeExpr(), visitRangeExpr);
}
function visitRangeExpr(ctx: RangeExprContext): IAST {
	return binaryOp('rangeSequenceExpr', ctx.additiveExpr(), visitAdditiveExpr);
}
function visitAdditiveExpr(ctx: AdditiveExprContext): IAST {
	for (let i = 0; i < 3; i++) {
		console.log(ctx.PLUS(i));
	}
	const hasPlus = ctx.PLUS().length !== 0;
	const hasMinus = ctx.MINUS().length !== 0;
	if (hasPlus && !hasMinus) {
		return binaryOp('addOp', ctx.multiplicativeExpr(), visitMultiplicativeExpr);
	} else if (hasMinus && !hasPlus) {
		return binaryOp('subtractOp', ctx.multiplicativeExpr(), visitMultiplicativeExpr);
	} else {
		if (!hasPlus && !hasMinus) {
			return visitMultiplicativeExpr(ctx.multiplicativeExpr()[0]);
		}
		// TODO: add support for 'a + b - c'
		throw new Error('Not implemented');
	}
}
function visitMultiplicativeExpr(ctx: MultiplicativeExprContext): IAST {
	if (ctx.STAR().length != 0) {
		return binaryOp('multiplyOp', ctx.unionExpr(), visitUnionExpr);
	} else if (ctx.KW_DIV().length != 0) {
		return binaryOp('divOp', ctx.unionExpr(), visitUnionExpr);
	} else if (ctx.KW_IDIV().length != 0) {
		return binaryOp('idivOp', ctx.unionExpr(), visitUnionExpr);
	} else if (ctx.KW_MOD().length != 0) {
		return binaryOp('modOp', ctx.unionExpr(), visitUnionExpr);
	} else {
		// TODO: add support for 'a * b / c'
		throw new Error('Not implemented');
	}
}
function visitUnionExpr(ctx: UnionExprContext): IAST {
	return binaryOp('unionOp', ctx.intersectExceptExpr(), visitIntersectExceptExpr);
}
function visitIntersectExceptExpr(ctx: IntersectExceptExprContext): IAST {
	if (ctx.KW_INTERSECT().length != 0) {
		return binaryOp('intersectOp', ctx.instanceOfExpr(), visitInstanceOfExpr);
	} else if (ctx.KW_EXCEPT().length != 0) {
		return binaryOp('exceptOp', ctx.instanceOfExpr(), visitInstanceOfExpr);
	} else {
		// TODO: add support for 'a intersect b except c'
		throw new Error('Not implemented');
	}
}
function visitInstanceOfExpr(ctx: InstanceOfExprContext): IAST {
	throw new Error('Not implemented');
}
function visitTreatExpr(ctx: TreatExprContext): IAST {
	throw new Error('Not implemented');
}
function visitCastableExpr(ctx: CastableExprContext): IAST {
	throw new Error('Not implemented');
}
function visitCastExpr(ctx: CastExprContext): IAST {
	throw new Error('Not implemented');
}
function visitArrowExpr(ctx: ArrowExprContext): IAST {
	throw new Error('Not implemented');
}
function visitUnaryExpression(ctx: UnaryExpressionContext): IAST {
	throw new Error('Not implemented');
}
function visitValueExpr(ctx: ValueExprContext): IAST {
	throw new Error('Not implemented');
}
function visitGeneralComp(ctx: GeneralCompContext): IAST {
	throw new Error('Not implemented');
}
function visitValueComp(ctx: ValueCompContext): IAST {
	throw new Error('Not implemented');
}
function visitNodeComp(ctx: NodeCompContext): IAST {
	throw new Error('Not implemented');
}
function visitValidateExpr(ctx: ValidateExprContext): IAST {
	throw new Error('Not implemented');
}
function visitValidationMode(ctx: ValidationModeContext): IAST {
	throw new Error('Not implemented');
}
function visitExtensionExpr(ctx: ExtensionExprContext): IAST {
	throw new Error('Not implemented');
}
function visitSimpleMapExpr(ctx: SimpleMapExprContext): IAST {
	throw new Error('Not implemented');
}
function visitPathExpr(ctx: PathExprContext): IAST {
	throw new Error('Not implemented');
}
function visitRelativePathExpr(ctx: RelativePathExprContext): IAST {
	throw new Error('Not implemented');
}
function visitStepExpr(ctx: StepExprContext): IAST {
	throw new Error('Not implemented');
}
function visitAxisStep(ctx: AxisStepContext): IAST {
	throw new Error('Not implemented');
}
function visitForwardStep(ctx: ForwardStepContext): IAST {
	throw new Error('Not implemented');
}
function visitForwardAxis(ctx: ForwardAxisContext): IAST {
	throw new Error('Not implemented');
}
function visitAbbrevForwardStep(ctx: AbbrevForwardStepContext): IAST {
	throw new Error('Not implemented');
}
function visitReverseStep(ctx: ReverseStepContext): IAST {
	throw new Error('Not implemented');
}
function visitReverseAxis(ctx: ReverseAxisContext): IAST {
	throw new Error('Not implemented');
}
function visitAbbrevReverseStep(ctx: AbbrevReverseStepContext): IAST {
	throw new Error('Not implemented');
}
function visitNodeTest(ctx: NodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitNameTest(ctx: NameTestContext): IAST {
	throw new Error('Not implemented');
}
function visitWildcard(ctx: WildcardContext): IAST {
	throw new Error('Not implemented');
}
function visitPostfixExpr(ctx: PostfixExprContext): IAST {
	throw new Error('Not implemented');
}
function visitArgumentList(ctx: ArgumentListContext): IAST {
	throw new Error('Not implemented');
}
function visitPredicateList(ctx: PredicateListContext): IAST {
	throw new Error('Not implemented');
}
function visitPredicate(ctx: PredicateContext): IAST {
	throw new Error('Not implemented');
}
function visitLookup(ctx: LookupContext): IAST {
	throw new Error('Not implemented');
}
function visitKeySpecifier(ctx: KeySpecifierContext): IAST {
	throw new Error('Not implemented');
}
function visitArrowFunctionSpecifier(ctx: ArrowFunctionSpecifierContext): IAST {
	throw new Error('Not implemented');
}
function visitPrimaryExpr(ctx: PrimaryExprContext): IAST {
	throw new Error('Not implemented');
}
function visitLiteral(ctx: LiteralContext): IAST {
	throw new Error('Not implemented');
}
function visitNumericLiteral(ctx: NumericLiteralContext): IAST {
	throw new Error('Not implemented');
}
function visitVarRef(ctx: VarRefContext): IAST {
	throw new Error('Not implemented');
}
function visitVarName(ctx: VarNameContext): IAST {
	throw new Error('Not implemented');
}
function visitParenthesizedExpr(ctx: ParenthesizedExprContext): IAST {
	throw new Error('Not implemented');
}
function visitContextItemExpr(ctx: ContextItemExprContext): IAST {
	throw new Error('Not implemented');
}
function visitOrderedExpr(ctx: OrderedExprContext): IAST {
	throw new Error('Not implemented');
}
function visitUnorderedExpr(ctx: UnorderedExprContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionCall(ctx: FunctionCallContext): IAST {
	throw new Error('Not implemented');
}
function visitArgument(ctx: ArgumentContext): IAST {
	throw new Error('Not implemented');
}
function visitNodeConstructor(ctx: NodeConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitDirectConstructor(ctx: DirectConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitDirElemConstructorOpenClose(ctx: DirElemConstructorOpenCloseContext): IAST {
	throw new Error('Not implemented');
}
function visitDirElemConstructorSingleTag(ctx: DirElemConstructorSingleTagContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeList(ctx: DirAttributeListContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeValueApos(ctx: DirAttributeValueAposContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeValueQuot(ctx: DirAttributeValueQuotContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeValue(ctx: DirAttributeValueContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeContentQuot(ctx: DirAttributeContentQuotContext): IAST {
	throw new Error('Not implemented');
}
function visitDirAttributeContentApos(ctx: DirAttributeContentAposContext): IAST {
	throw new Error('Not implemented');
}
function visitDirElemContent(ctx: DirElemContentContext): IAST {
	throw new Error('Not implemented');
}
function visitCommonContent(ctx: CommonContentContext): IAST {
	throw new Error('Not implemented');
}
function visitComputedConstructor(ctx: ComputedConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONConstructor(ctx: CompMLJSONConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONArrayConstructor(ctx: CompMLJSONArrayConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONObjectConstructor(ctx: CompMLJSONObjectConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONNumberConstructor(ctx: CompMLJSONNumberConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONBooleanConstructor(ctx: CompMLJSONBooleanConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompMLJSONNullConstructor(ctx: CompMLJSONNullConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompBinaryConstructor(ctx: CompBinaryConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompDocConstructor(ctx: CompDocConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompElemConstructor(ctx: CompElemConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitEnclosedContentExpr(ctx: EnclosedContentExprContext): IAST {
	throw new Error('Not implemented');
}
function visitCompAttrConstructor(ctx: CompAttrConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompNamespaceConstructor(ctx: CompNamespaceConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitPrefix(ctx: PrefixContext): IAST {
	throw new Error('Not implemented');
}
function visitEnclosedPrefixExpr(ctx: EnclosedPrefixExprContext): IAST {
	throw new Error('Not implemented');
}
function visitEnclosedURIExpr(ctx: EnclosedURIExprContext): IAST {
	throw new Error('Not implemented');
}
function visitCompTextConstructor(ctx: CompTextConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompCommentConstructor(ctx: CompCommentConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCompPIConstructor(ctx: CompPIConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionItemExpr(ctx: FunctionItemExprContext): IAST {
	throw new Error('Not implemented');
}
function visitNamedFunctionRef(ctx: NamedFunctionRefContext): IAST {
	throw new Error('Not implemented');
}
function visitInlineFunctionRef(ctx: InlineFunctionRefContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionBody(ctx: FunctionBodyContext): IAST {
	throw new Error('Not implemented');
}
function visitMapConstructor(ctx: MapConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitMapConstructorEntry(ctx: MapConstructorEntryContext): IAST {
	throw new Error('Not implemented');
}
function visitArrayConstructor(ctx: ArrayConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitSquareArrayConstructor(ctx: SquareArrayConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitCurlyArrayConstructor(ctx: CurlyArrayConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitStringConstructor(ctx: StringConstructorContext): IAST {
	throw new Error('Not implemented');
}
function visitStringConstructorContent(ctx: StringConstructorContentContext): IAST {
	throw new Error('Not implemented');
}
function visitCharNoGrave(ctx: CharNoGraveContext): IAST {
	throw new Error('Not implemented');
}
function visitCharNoLBrace(ctx: CharNoLBraceContext): IAST {
	throw new Error('Not implemented');
}
function visitCharNoRBrack(ctx: CharNoRBrackContext): IAST {
	throw new Error('Not implemented');
}
function visitStringConstructorChars(ctx: StringConstructorCharsContext): IAST {
	throw new Error('Not implemented');
}
function visitStringConstructorInterpolation(ctx: StringConstructorInterpolationContext): IAST {
	throw new Error('Not implemented');
}
function visitUnaryLookup(ctx: UnaryLookupContext): IAST {
	throw new Error('Not implemented');
}
function visitSingleType(ctx: SingleTypeContext): IAST {
	throw new Error('Not implemented');
}
function visitTypeDeclaration(ctx: TypeDeclarationContext): IAST {
	throw new Error('Not implemented');
}
function visitSequenceType(ctx: SequenceTypeContext): IAST {
	throw new Error('Not implemented');
}
function visitItemType(ctx: ItemTypeContext): IAST {
	throw new Error('Not implemented');
}
function visitAtomicOrUnionType(ctx: AtomicOrUnionTypeContext): IAST {
	throw new Error('Not implemented');
}
function visitKindTest(ctx: KindTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAnyKindTest(ctx: AnyKindTestContext): IAST {
	throw new Error('Not implemented');
}
function visitBinaryNodeTest(ctx: BinaryNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitDocumentTest(ctx: DocumentTestContext): IAST {
	throw new Error('Not implemented');
}
function visitTextTest(ctx: TextTestContext): IAST {
	throw new Error('Not implemented');
}
function visitCommentTest(ctx: CommentTestContext): IAST {
	throw new Error('Not implemented');
}
function visitNamespaceNodeTest(ctx: NamespaceNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitPiTest(ctx: PiTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAttributeTest(ctx: AttributeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAttributeNameOrWildcard(ctx: AttributeNameOrWildcardContext): IAST {
	throw new Error('Not implemented');
}
function visitSchemaAttributeTest(ctx: SchemaAttributeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitElementTest(ctx: ElementTestContext): IAST {
	throw new Error('Not implemented');
}
function visitElementNameOrWildcard(ctx: ElementNameOrWildcardContext): IAST {
	throw new Error('Not implemented');
}
function visitSchemaElementTest(ctx: SchemaElementTestContext): IAST {
	throw new Error('Not implemented');
}
function visitElementDeclaration(ctx: ElementDeclarationContext): IAST {
	throw new Error('Not implemented');
}
function visitAttributeName(ctx: AttributeNameContext): IAST {
	throw new Error('Not implemented');
}
function visitElementName(ctx: ElementNameContext): IAST {
	throw new Error('Not implemented');
}
function visitSimpleTypeName(ctx: SimpleTypeNameContext): IAST {
	throw new Error('Not implemented');
}
function visitTypeName(ctx: TypeNameContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionTest(ctx: FunctionTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAnyFunctionTest(ctx: AnyFunctionTestContext): IAST {
	throw new Error('Not implemented');
}
function visitTypedFunctionTest(ctx: TypedFunctionTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMapTest(ctx: MapTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAnyMapTest(ctx: AnyMapTestContext): IAST {
	throw new Error('Not implemented');
}
function visitTypedMapTest(ctx: TypedMapTestContext): IAST {
	throw new Error('Not implemented');
}
function visitArrayTest(ctx: ArrayTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAnyArrayTest(ctx: AnyArrayTestContext): IAST {
	throw new Error('Not implemented');
}
function visitTypedArrayTest(ctx: TypedArrayTestContext): IAST {
	throw new Error('Not implemented');
}
function visitParenthesizedItemTest(ctx: ParenthesizedItemTestContext): IAST {
	throw new Error('Not implemented');
}
function visitAttributeDeclaration(ctx: AttributeDeclarationContext): IAST {
	throw new Error('Not implemented');
}
function visitMlNodeTest(ctx: MlNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMlArrayNodeTest(ctx: MlArrayNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMlObjectNodeTest(ctx: MlObjectNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMlNumberNodeTest(ctx: MlNumberNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMlBooleanNodeTest(ctx: MlBooleanNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitMlNullNodeTest(ctx: MlNullNodeTestContext): IAST {
	throw new Error('Not implemented');
}
function visitEqName(ctx: EqNameContext): IAST {
	throw new Error('Not implemented');
}
function visitQName(ctx: QNameContext): IAST {
	throw new Error('Not implemented');
}
function visitNcName(ctx: NcNameContext): IAST {
	throw new Error('Not implemented');
}
function visitFunctionName(ctx: FunctionNameContext): IAST {
	throw new Error('Not implemented');
}
function visitKeyword(ctx: KeywordContext): IAST {
	throw new Error('Not implemented');
}
function visitKeywordNotOKForFunction(ctx: KeywordNotOKForFunctionContext): IAST {
	throw new Error('Not implemented');
}
function visitKeywordOKForFunction(ctx: KeywordOKForFunctionContext): IAST {
	throw new Error('Not implemented');
}
function visitUriLiteral(ctx: UriLiteralContext): IAST {
	throw new Error('Not implemented');
}
function visitStringLiteralQuot(ctx: StringLiteralQuotContext): IAST {
	throw new Error('Not implemented');
}
function visitStringLiteralApos(ctx: StringLiteralAposContext): IAST {
	throw new Error('Not implemented');
}
function visitStringLiteral(ctx: StringLiteralContext): IAST {
	throw new Error('Not implemented');
}
function visitStringContentQuot(ctx: StringContentQuotContext): IAST {
	throw new Error('Not implemented');
}
function visitStringContentApos(ctx: StringContentAposContext): IAST {
	throw new Error('Not implemented');
}
function visitNoQuotesNoBracesNoAmpNoLAng(ctx: NoQuotesNoBracesNoAmpNoLAngContext): IAST {
	throw new Error('Not implemented');
}
