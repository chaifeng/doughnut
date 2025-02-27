package com.odde.doughnut.entities.json;

import com.odde.doughnut.entities.*;
import com.odde.doughnut.factoryServices.ModelFactoryService;
import com.odde.doughnut.models.NoteViewer;
import com.odde.doughnut.models.quizFacotries.QuizQuestionPresenter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Getter;
import org.apache.logging.log4j.util.Strings;
import org.springframework.lang.Nullable;

public class QuizQuestionViewedByUser {

  public QuizQuestion quizQuestion;

  @Getter public QuizQuestion.QuestionType questionType;

  @Getter public String description;

  @Getter public String mainTopic;

  @Getter public LinksOfANote hintLinks;

  @Getter public List<Integer> viceReviewPointIdList;

  @Getter @Nullable public NotePositionViewedByUser notebookPosition;

  @Getter public List<Option> options;

  public Optional<PictureWithMask> pictureWithMask;

  public QuizQuestionViewedByUser(
      QuizQuestion quizQuestion, ModelFactoryService modelFactoryService, User user) {
    QuizQuestionPresenter presenter = quizQuestion.buildPresenter();
    this.quizQuestion = quizQuestion;
    questionType = quizQuestion.getQuestionType();
    description = presenter.instruction();
    mainTopic = presenter.mainTopic();
    hintLinks = presenter.hintLinks();
    pictureWithMask = presenter.pictureWithMask();
    options =
        getOptions(
            presenter.optionCreator(), modelFactoryService, quizQuestion.getOptionThingIds());
    viceReviewPointIdList = quizQuestion.getViceReviewPointIdList();
    if (questionType == QuizQuestion.QuestionType.JUST_REVIEW) return;
    notebookPosition =
        new NoteViewer(user, quizQuestion.getReviewPoint().getHeadNote()).jsonNotePosition(true);
  }

  static List<Option> getOptions(
      OptionCreator optionCreator, ModelFactoryService modelFactoryService, String optionThingIds) {
    if (Strings.isBlank(optionThingIds)) return List.of();
    List<Integer> idList =
        Arrays.stream(optionThingIds.split(","))
            .map(Integer::parseInt)
            .collect(Collectors.toList());
    Stream<Thing> noteStream =
        modelFactoryService
            .thingRepository
            .findAllByIds(idList)
            .sorted(Comparator.comparing(v -> idList.indexOf(v.getId())));
    return noteStream.map(optionCreator::optionFromThing).toList();
  }

  public static class Option {
    @Getter private Integer noteId;
    @Getter private boolean isPicture = false;
    @Getter private String display;
    @Getter @Nullable private PictureWithMask pictureWithMask;

    private Option() {}
  }

  public interface OptionCreator {
    Option optionFromThing(Thing thing);
  }

  public static class TitleOptionCreator implements OptionCreator {
    @Override
    public Option optionFromThing(Thing thing) {
      Option option = new Option();
      option.noteId = thing.getNote().getId();
      option.display = thing.getNote().getTitle();
      return option;
    }
  }

  public static class PictureOptionCreator implements OptionCreator {
    @Override
    public Option optionFromThing(Thing thing) {
      Option option = new Option();
      option.noteId = thing.getNote().getId();
      option.display = thing.getNote().getTitle();
      option.pictureWithMask = thing.getNote().getPictureWithMask().orElse(null);
      option.isPicture = true;
      return option;
    }
  }

  public static class ClozeLinkOptionCreator implements OptionCreator {
    @Override
    public Option optionFromThing(Thing thing) {
      Option option = new Option();
      option.noteId = thing.getLink().getSourceNote().getId();
      option.display = thing.getLink().getClozeSource().cloze();
      return option;
    }
  }
}
